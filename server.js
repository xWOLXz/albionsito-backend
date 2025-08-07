const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { fetchAlbionData } = require('./fetchAlbionData');
const { log } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const PRICES_PATH = path.join(__dirname, 'data', 'prices.json');

// Endpoint para obtener los datos
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PRICES_PATH, 'utf8'));
    res.json(data);
  } catch (error) {
    log(`❌ Error al leer los datos: ${error.message}`);
    res.status(500).json({ error: 'Error al leer los datos' });
  }
});

// Ejecutar una vez al inicio
fetchAlbionData();

// Ejecutar cada 10 minutos
cron.schedule('*/10 * * * *', () => {
  log('🔁 Ejecutando actualización programada de precios...');
  fetchAlbionData();
});

app.listen(PORT, () => {
  log(`🚀 Servidor backend AlbionData escuchando en el puerto ${PORT}`);
});
