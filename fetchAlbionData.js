const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log } = require('./utils/logger');

const ITEMS_PATH = path.join(__dirname, 'data', 'items.json');
const OUTPUT_PATH = path.join(__dirname, 'data', 'prices.json');

const LOCATIONS = ['Bridgewatch', 'Martlock', 'Fort Sterling', 'Thetford', 'Lymhurst']; // solo ciudades del servidor AMÉRICA
const QUALITIES = [1];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAlbionData() {
  try {
    const items = JSON.parse(fs.readFileSync(ITEMS_PATH, 'utf8'));
    const allData = [];

    for (const item of items) {
      const url = `https://west.albion-online-data.com/api/v2/stats/prices/${item}.json?locations=${LOCATIONS.join(',')}&qualities=${QUALITIES.join(',')}`;
      log(`Consultando API Albion Data: ${item}`);
      const response = await axios.get(url);
      allData.push(...response.data);

      await delay(300); // Delay para evitar bloqueos
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    log(`✅ Precios actualizados correctamente: ${allData.length} registros`);
  } catch (error) {
    log(`❌ Error al consultar la API de Albion Data: ${error.message}`);
  }
}

module.exports = { fetchAlbionData };
