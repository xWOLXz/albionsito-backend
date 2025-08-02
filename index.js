const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let cacheItems = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// 🔍 Función para cargar los ítems reales desde GitHub
async function fetchItemsFromAPI() {
  try {
    console.log('🔄 Cargando ítems desde GitHub...');
    const response = await axios.get('https://raw.githubusercontent.com/mildrar/albion-data/main/items.json');
    const rawItems = response.data;

    console.log(`📦 Ítems crudos obtenidos: ${rawItems.length}`);

    // Solo dejamos ítems comerciales válidos
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
    console.error('❌ Error al obtener los ítems:', error.message);
  }
}

// 🧠 Ruta para paginar los ítems almacenados
app.get('/items', async (req, res) => {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION || cacheItems.length === 0) {
    console.log('⚠️ Cache vacía o expirada. Re-obteniendo ítems...');
    await fetchItemsFromAPI();
  }

  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 30;
  const total = cacheItems.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedItems = cacheItems.slice(start, start + itemsPerPage);

  res.json({
    total,
    page,
    totalPages,
    items: paginatedItems,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
