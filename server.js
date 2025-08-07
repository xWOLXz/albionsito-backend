const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const log = require('./utils/logger');
const fetchAlbionData = require('./fetchAlbionData');
const fetchAlbion2D = require('./fetchAlbion2D');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Rutas API
app.get('/api/prices', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'prices-albiondata.json'), 'utf8');
  res.json(JSON.parse(data));
});

app.get('/api2/prices', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'prices-albion2d.json'), 'utf8');
  res.json(JSON.parse(data));
});

// Ejecutar robos al iniciar y luego cada 10 minutos
async function startFetching() {
  await fetchAlbionData();
  await fetchAlbion2D();

  setInterval(fetchAlbionData, 10 * 60 * 1000);
  setInterval(fetchAlbion2D, 10 * 60 * 1000);
}

app.listen(PORT, () => {
  log(`✅ Backend corriendo en http://localhost:${PORT}`);
  startFetching();
});
