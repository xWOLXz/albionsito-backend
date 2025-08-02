const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let cacheItems = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

async function fetchItemsFromAPI() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/mildrar/albion-data/main/items.json');
    const rawItems = response.data;

    // Solo dejamos ítems comerciales válidos con nombre y tier
    const filteredItems = rawItems.filter(item =>
      item.UniqueName &&
      item.LocalizedNames &&
      item.LocalizedNames['ES-ES'] &&
      !item.UniqueName.includes("QUEST") &&
      !item.UniqueName.includes("SKIN") &&
      !item.UniqueName.includes("JOURNAL") &&
      !item.UniqueName.includes("TROPHY") &&
      !item.UniqueName.includes("BLACKMARKET")
    );

    cacheItems = filteredItems;
    console.log(`✅ Ítems cargados al backend: ${cacheItems.length}`);
  } catch (error) {
    console.error('Error al obtener los ítems desde la fuente:', error.message);
  }
}

app.get('/items', async (req, res) => {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION || cacheItems.length === 0) {
    await fetchItemsFromAPI();
  }

  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 30;
  const start = (page - 1) * itemsPerPage;
  const paginatedItems = cacheItems.slice(start, start + itemsPerPage);

  res.json({
    total: cacheItems.length,
    page,
    totalPages: Math.ceil(cacheItems.length / itemsPerPage),
    items: paginatedItems
  });
});

app.get('/precios', async (req, res) => {
  const itemId = req.query.itemId;
  if (!itemId) {
    return res.status(400).json({ error: 'Falta el parámetro itemId' });
  }

  try {
    const response = await axios.get(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=Bridgewatch,Martlock,Lymhurst,Fortsterling,Thetford,BlackMarket&qualities=1`);
    const data = response.data;

    const sell = data.filter(e => e.sell_price_min > 0).sort((a, b) => a.sell_price_min - b.sell_price_min)[0];
    const buy = data.filter(e => e.buy_price_max > 0).sort((a, b) => b.buy_price_max - a.buy_price_max)[0];

    const margen = sell && buy ? sell.sell_price_min - buy.buy_price_max : 0;

    res.json({
      buy: buy ? { price: buy.buy_price_max, city: buy.city } : null,
      sell: sell ? { price: sell.sell_price_min, city: sell.city } : null,
      margen
    });
  } catch (error) {
    console.error('Error al obtener precios:', error.message);
    res.status(500).json({ error: 'Error al obtener precios del item' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
