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

// Normalizar a formato Backend2  
const result = {};  
data.forEach(entry => {  
  const city = entry.city || entry.location;  
  if (!result[city]) {  
    result[city] = { sell: [], buy: [], updated: null };  
  }  
  if (entry.sell_price_min && entry.sell_price_min > 0) {  
    result[city].sell.push({  
      price: entry.sell_price_min,  
      date: entry.sell_price_min_date || new Date().toISOString()  
    });  
  }  
  if (entry.buy_price_max && entry.buy_price_max > 0) {  
    result[city].buy.push({  
      price: entry.buy_price_max,  
      date: entry.buy_price_max_date || new Date().toISOString()  
    });  
  }  
  const dateCandidates = [  
    entry.sell_price_min_date,  
    entry.buy_price_max_date  
  ].filter(Boolean);  
  for (const d of dateCandidates) {  
    if (!result[city].updated || new Date(d) > new Date(result[city].updated)) {  
      result[city].updated = d;  
    }  
  }  
});  

// Ordenar por fecha y limitar a últimos 5  
Object.keys(result).forEach(city => {  
  result[city].sell = result[city].sell  
    .sort((a, b) => new Date(b.date) - new Date(a.date))  
    .slice(0, 5);  

  result[city].buy = result[city].buy  
    .sort((a, b) => new Date(b.date) - new Date(a.date))  
    .slice(0, 5);  
});  

// Guardar en cache  
try {  
  const cache = JSON.parse(fs.readFileSync(OUTPUT, 'utf8') || '{}');  
  cache.items = cache.items || {};  
  cache.items[itemId] = { updated: new Date().toISOString(), data: result };  
  fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));  
} catch (e) {  
  log('[Backend1] warning writing cache', e.message);  
}  

res.json({ item: itemId, prices: result });

} catch (err) {
log('[Backend1] error /api/prices', err);
res.status(500).json({ error: 'Error interno backend1' });
}
});

fetchAlbionData();
cron.schedule('*/10 * * * *', () => {
log('[Backend1] Cron: actualizando cache AlbionData every 10m');
fetchAlbionData();
});

app.listen(PORT, () => {
console.log(`🚀 Servidor albionsito-backend escuchando en http://localhost:${PORT}`);
});
