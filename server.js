const express = require('express');
const cors = require('cors');
const { fetchAlbionData, fetchPricesForItem, OUTPUT } = require('./fetchAlbionData');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { log } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

/**
 * /api/init -> inicializa cache
 * /api/prices?itemId=...&quality=1 -> devuelve estructura con top ventas/compras por ciudad
 */

app.get('/api/init', async (req, res) => {
  try {
    await fetchAlbionData();
    res.json({ ok: true, source: 'backend1', timestamp: new Date().toISOString() });
  } catch (err) {
    log('[Backend1] /api/init error', err);
    res.status(500).json({ error: 'init failed' });
  }
});

app.get('/api/prices', async (req, res) => {
  const { itemId, quality = 1 } = req.query;
  if (!itemId) return res.status(400).json({ error: 'itemId required' });
  log(`[Backend1] peticion /api/prices item=${itemId} quality=${quality}`);

  try {
    const data = await fetchPricesForItem(itemId, quality);
    // data es array con objetos por ciudad
    const result = {};
    data.forEach(entry => {
      const city = entry.city || entry.location;
      if (!result[city]) result[city] = { orden_venta: [], orden_compra: [], actualizado: new Date().toISOString() };
      if (entry.sell_price_min && entry.sell_price_min > 0) {
        result[city].orden_venta.push({ precio: entry.sell_price_min, fecha: entry.sell_price_min_date || new Date().toISOString() });
      }
      if (entry.buy_price_max && entry.buy_price_max > 0) {
        result[city].orden_compra.push({ precio: entry.buy_price_max, fecha: entry.buy_price_max_date || new Date().toISOString() });
      }
    });

    // ordenar y limitar top 10
    Object.keys(result).forEach(city => {
      result[city].orden_venta = result[city].orden_venta.sort((a,b)=>a.precio-b.precio).slice(0,10);
      result[city].orden_compra = result[city].orden_compra.sort((a,b)=>b.precio-a.precio).slice(0,10);
    });

    // save small cache (no necesario, pero para inspección)
    try {
      const cache = JSON.parse(fs.readFileSync(OUTPUT, 'utf8') || '{}');
      cache.items = cache.items || {};
      cache.items[itemId] = { updated: new Date().toISOString(), data: result };
      fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));
    } catch(e){ log('[Backend1] warning writing cache', e.message); }

    res.json({ item: itemId, precios: result });
  } catch (err) {
    log('[Backend1] error /api/prices', err);
    res.status(500).json({ error: 'Error interno backend1' });
  }
});

// Ejecutamos fetchAlbionData al iniciar y programamos cron cada 10 minutos (puedes bajar a 5)
fetchAlbionData();
cron.schedule('*/10 * * * *', () => {
  log('[Backend1] Cron: actualizando cache AlbionData every 10m');
  fetchAlbionData();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor albionsito-backend escuchando en http://localhost:${PORT} / port ${PORT}`);
});
