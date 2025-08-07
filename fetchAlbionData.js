const axios = require('axios');
const fs = require('fs');
const path = require('path');
const log = require('./utils/logger');
const ITEMS = require('./data/items.json');
const LOCATIONS = ['Bridgewatch', 'Martlock', 'Fort Sterling', 'Thetford', 'Lymhurst', 'Caerleon'];
const QUALITIES = [1];

async function fetchAlbionData() {
  log('Robando datos desde Albion Data API...');

  const url = `https://west.albion-online-data.com/api/v2/stats/prices/${ITEMS.join(',')}?locations=${LOCATIONS.join(',')}&qualities=${QUALITIES.join(',')}`;

  try {
    const res = await axios.get(url);
    const data = res.data;
    fs.writeFileSync(path.join(__dirname, 'data', 'prices-albiondata.json'), JSON.stringify(data, null, 2));
    log(`Datos guardados: ${data.length} registros.`);
  } catch (error) {
    log('Error robando datos de Albion Data API:', error.message);
  }
}

module.exports = fetchAlbionData;
