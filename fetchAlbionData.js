// albionsito-backend/fetchAlbionData.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log, error } = require('./utils/logger');

const OUTPUT = path.join(__dirname, 'data', 'prices.json');
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'Fort Sterling', 'Brecilien'];

// Función que consulta precios por ítem y calidad desde API Albion Online Data
async function fetchPricesForItem(itemId, quality = 1) {
  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}.json?locations=${LOCATIONS.join(',')}&qualities=${quality}`;
    log(`[Backend1] GET ${url}`);
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    log(`[Backend1] Error fetchPricesForItem ${itemId}:`, err.message || err);
    return [];
  }
}

// Función principal que actualiza el cache general con todos los ítems de items.json
async function fetchAlbionData() {
  try {
    log('[Backend1] Inicio actualización cache prices.json');

    // Leer items.json para obtener IDs
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    const itemsRaw = fs.readFileSync(itemsPath, 'utf8');
    const itemsJson = JSON.parse(itemsRaw);

    // Extraer solo IDs de los objetos
    const itemIds = Array.isArray(itemsJson) ? itemsJson.map(item => item.id).filter(Boolean) : [];

    const cache = { updated: new Date().toISOString(), items: {} };

    // Consultar y almacenar precios por ítem
    for (const itemId of itemIds) {
      log(`[Backend1] Actualizando item: ${itemId}`);
      const data = await fetchPricesForItem(itemId);
      if (data) {
        cache.items[itemId] = {
          updated: new Date().toISOString(),
          data,
        };
      } else {
        log(`[Backend1] No se pudo obtener datos para ${itemId}`);
      }
      // Espera para evitar saturar API
      await new Promise(r => setTimeout(r, 200));
    }

    // Guardar cache actualizado
    fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));
    log('[Backend1] Cache general actualizada correctamente');
  } catch (err) {
    error('[Backend1] Error en fetchAlbionData:', err.message || err);
  }
}

module.exports = { fetchAlbionData, fetchPricesForItem, OUTPUT };
