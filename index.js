const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let cacheItems = [];
const ITEMS_PER_PAGE = 30;

// ✅ Función que carga los ítems antes de iniciar el servidor
async function fetchItemsFromAPI() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/mildrar/albion-data/main/items.json');
    const rawItems = response.data;

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
    console.error('❌ Error al obtener los ítems desde GitHub:', error.message);
  }
}

app.get('/items', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const total = cacheItems.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = cacheItems.slice(start, start + ITEMS_PER_PAGE);

  res.json({
    total,
    page,
    totalPages,
    items,
  });
});

// ✅ Carga ítems antes de iniciar el servidor
fetchItemsFromAPI().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
});
// Ejecutar la descarga de ítems apenas arranca el servidor
fetchItemsFromAPI();

