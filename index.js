// 📁 backend1/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

let cachedPrices = [];
let lastUpdated = null;

const ITEMS = [
  'T4_BAG','T5_BAG','T6_BAG','T7_BAG','T8_BAG',
  'T4_CAPE','T5_CAPE','T6_CAPE','T7_CAPE','T8_CAPE'
];
const LOCATIONS = ['Bridgewatch', 'Martlock', 'Fort Sterling', 'Thetford', 'Lymhurst', 'Caerleon'];
const QUALITIES = [1];

const fetchAlbionData = async () => {
  try {
    console.log('📡 Robando datos de la API AlbionData West...');

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${ITEMS.join(',')}?locations=${LOCATIONS.join(',')}&qualities=${QUALITIES.join(',')}`;
    const response = await axios.get(url);

    cachedPrices = response.data;
    lastUpdated = new Date();

    console.log(`✅ Datos actualizados correctamente. Última actualización: ${lastUpdated.toISOString()}`);
  } catch (error) {
    console.error('❌ Error al obtener datos de AlbionData West:', error.message);
  }
};

// Ejecutar la función al iniciar
fetchAlbionData();

// Repetir cada 10 minutos
setInterval(fetchAlbionData, 10 * 60 * 1000);

// Endpoint para consultar precios
app.get('/api/prices', (req, res) => {
  res.json({
    source: 'AlbionData West',
    lastUpdated,
    items: cachedPrices
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend 1 corriendo en http://localhost:${PORT}`);
});
