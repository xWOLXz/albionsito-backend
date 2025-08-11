const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

const OUTPUT = path.join(__dirname, 'data', 'prices.json');
const ITEMS_FILE = path.join(__dirname, 'data', 'items.json');
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'Fort Sterling', 'Brecilien'];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPricesForItem(itemId, quality = 1) {
  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}.json?locations=${LOCATIONS.join(',')}&qualities=${quality}`;
    log(`[Backend1] GET ${url}`);
    const r = await axios.get(url);
    return r.data;
  } catch (err) {
    log(`[Backend1] Error fetchPricesForItem ${itemId}:`, err.message || err);
    throw err;
  }
}

async function fetchAlbionData() {
  try {
    log('[Backend1] Actualizando cache de precios (Albion Data) - inicio');

    let cache = { updated: new Date().toISOString(), items: {} };

    try {
      const rawCache = fs.readFileSync(OUTPUT, 'utf8');
      cache = JSON.parse(rawCache);
    } catch {
      log('[Backend1] Cache no encontrada o corrupta, se crea nueva.');
    }

    const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf8'));

    for (const item of items) {
      log(`[Backend1] Actualizando item: ${item.id}`);

      const lastUpdate = cache.items[item.id]?.updated;
      if (lastUpdate) {
        const diffMinutes = (new Date() - new Date(lastUpdate)) / 1000 / 60;
        if (diffMinutes < 10) {
          log(`[Backend1] Saltando item ${item.id}, cache fresca (${diffMinutes.toFixed(1)} min)`);
          continue;
        }
      }

      try {
        const data = await fetchPricesForItem(item.id, 1);

        const result = {};
        data.forEach(entry => {
          const city = entry.city || entry.location;
          if (!result[city]) {
            result[city] = { sell: [], buy: [], updated: null };
          }
          if (entry.sell_price_min && entry.sell_price_min > 0) {
            result[city].sell.push({
              price: entry.sell_price_min,
              date: entry.sell_price_min_date || new Date().toISOString()
            });
          }
          if (entry.buy_price_max && entry.buy_price_max > 0) {
            result[city].buy.push({
              price: entry.buy_price_max,
              date: entry.buy_price_max_date || new Date().toISOString()
            });
          }
          const dateCandidates = [entry.sell_price_min_date, entry.buy_price_max_date].filter(Boolean);
          for (const d of dateCandidates) {
            if (!result[city].updated || new Date(d) > new Date(result[city].updated)) {
              result[city].updated = d;
            }
          }
        });

        Object.keys(result).forEach(city => {
          result[city].sell = result[city].sell
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

          result[city].buy = result[city].buy
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        });

        cache.items[item.id] = { updated: new Date().toISOString(), data: result };

        await sleep(1000);

      } catch (e) {
        log(`[Backend1] Error al actualizar item ${item.id}: ${e.message || e}`);
        await sleep(3000);
      }
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));
    log('[Backend1] Cache de precios actualizada correctamente.');

  } catch (err) {
    log('[Backend1] Error general fetchAlbionData:', err);
  }
}

module.exports = { fetchAlbionData, fetchPricesForItem, OUTPUT };
