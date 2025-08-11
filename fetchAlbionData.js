// albionsito-backend/fetchAlbionData.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

const OUTPUT = path.join(__dirname, 'data', 'prices.json');
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'Fort Sterling', 'Brecilien'];

// Función para normalizar y agrupar la data por ciudad, ordenando y limitando a 5 precios recientes
function normalizeApi(apiData) {
  const result = {};
  if (!apiData || !Array.isArray(apiData)) return result;

  for (const entry of apiData) {
    const city = entry.city || entry.location;
    if (!city) continue;

    if (!result[city]) result[city] = { sell: [], buy: [], updated: null };

    if (entry.sell_price_min && entry.sell_price_min > 0) {
      result[city].sell.push({ price: entry.sell_price_min, date: entry.sell_price_min_date || null });
    }
    if (entry.buy_price_max && entry.buy_price_max > 0) {
      result[city].buy.push({ price: entry.buy_price_max, date: entry.buy_price_max_date || null });
    }

    const dates = [entry.sell_price_min_date, entry.buy_price_max_date].filter(Boolean);
    for (const d of dates) {
      if (!result[city].updated || new Date(d) > new Date(result[city].updated)) {
        result[city].updated = d;
      }
    }
  }

  // Ordenar y limitar a los últimos 5 precios
  for (const city of Object.keys(result)) {
    result[city].sell = result[city].sell
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    result[city].buy = result[city].buy
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }

  return result;
}

async function fetchPricesForItem(itemId, quality = 1) {
  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}.json?locations=${LOCATIONS.join(',')}&qualities=${quality}`;
    log(`[Backend1] GET ${url}`);
    const r = await axios.get(url);

    // Normalizamos la data para devolver solo los últimos 5 precios de venta y compra por ciudad
    const normalized = normalizeApi(r.data);
    return normalized;

  } catch (err) {
    log(`[Backend1] Error fetchPricesForItem ${itemId}:`, err.message || err);
    return {};
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

module.exports = { fetchAlbionData, fetchPricesForItem, OUTPUT };
