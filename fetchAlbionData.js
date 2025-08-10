
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

const OUTPUT = path.join(__dirname, 'data', 'prices.json');
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'Fort Sterling', 'Brecilien'];

async function fetchPricesForItem(itemId, quality = 1) {
try {
const url = 'https://west.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}.json?locations=${LOCATIONS.join(',')}&qualities=${quality}';
log([Backend1] GET ${url});
const r = await axios.get(url);
return r.data;
} catch (err) {
log([Backend1] Error fetchPricesForItem ${itemId}:, err.message || err);
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

module.exports = { fetchAlbionData, fetchPricesForItem, OUTPUT };
