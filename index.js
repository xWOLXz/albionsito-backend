const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

let cacheItems = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// ✅ URL funcional y rápida
const ITEMS_URL = 'https://cdn.jsdelivr.net/gh/mildrar/albion-items-dump@main/items.json';

async function fetchItemsFromAPI() {
  try {
    console.log('🔄 Cargando ítems desde GitHub...');
    const response = await axios.get(ITEMS_URL);
    const rawItems = response.data;

    console.log(`📦 Ítems crudos obtenidos: ${rawItems.length}`);

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

    console.log(`✅ Ítems comerciales filtrados: ${filteredItems.length}`);

    cacheItems = filteredItems;
    lastFetchTime = Date.now();
  } catch (error) {
    console.error('❌ Error al obtener los ítems desde GitHub:', error.message);
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
