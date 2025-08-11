// albionsito-backend/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { log, error } = require('./utils/logger');
const { fetchAlbionData, OUTPUT } = require('./fetchAlbionData');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Endpoint para comprobar que el backend está activo
app.get('/api/init', async (req, res) => {
  try {
    await fetchAlbionData();
    res.json({ ok: true, source: 'backend1', timestamp: new Date().toISOString() });
  } catch (err) {
    log('[Backend1] /api/init error', err);
    res.status(500).json({ error: 'init failed' });
  }
});

// Endpoint para consultar precios de un ítem con calidad opcional (default 1)
app.get('/api/prices', (req, res) => {
  const { itemId, quality = '1' } = req.query;
  if (!itemId) return res.status(400).json({ error: 'itemId required' });

  try {
    // Leer cache actualizado
    const cacheRaw = fs.readFileSync(OUTPUT, 'utf8');
    const cache = JSON.parse(cacheRaw);

    // Buscar datos del ítem en cache
    const itemData = cache.items && cache.items[itemId];
    if (!itemData) {
      return res.status(404).json({ error: 'Item not found in cache' });
    }

    // Filtrar por calidad si es necesario
    // (La API ya trae calidad filtrada, aquí solo devolvemos los datos tal cual)
    res.json({ item: itemId, quality, prices: itemData.data, updated: itemData.updated });
  } catch (err) {
    error('[Backend1] Error /api/prices:', err.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lanzar actualización inicial de cache en arranque
fetchAlbionData();

// Programar actualización cada 10 minutos
cron.schedule('*/10 * * * *', () => {
  log('[Backend1] Cron: actualizando cache prices.json cada 10 minutos');
  fetchAlbionData();
});

app.listen(PORT, () => {
  console.log(`🚀 albionsito-backend escuchando en http://localhost:${PORT}`);
});
