const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

const OUTPUT = path.join(__dirname, 'data', 'prices.json');
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'Fort Sterling', 'Brecilien'];

async function fetchPricesForItem(itemId, quality = 1) {
  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}.json?locations=${LOCATIONS.join(',')}&qualities=${quality}`;
    log(`[Backend1] GET ${url}`);
    const r = await axios.get(url);
    return r.data;
  } catch (err) {
    log(`[Backend1] Error fetchPricesForItem ${itemId}:`, err.message || err);
    return [];
  }
}

async function fetchAlbionData() {
  try {
    log('[Backend1] Actualizando cache de precios (Albion Data) - inicio');
    fs.writeFileSync(OUTPUT, JSON.stringify({ updated: new Date().toISOString(), items: {} }, null, 2));
    log('[Backend1] Cache inicializada.');
  } catch (err) {
    log('[Backend1] Error fetchAlbionData:', err);
  }
}

function normalizeApi(data) {
  const result = {};
  if (!Array.isArray(data)) return result;

  data.forEach(entry => {
    const city = entry.city || entry.location;
    if (!city) return;

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

  return result;
}

module.exports = { fetchAlbionData, fetchPricesForItem, normalizeApi, OUTPUT };
