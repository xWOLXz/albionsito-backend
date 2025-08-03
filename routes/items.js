// routes/items.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

let cachedItems = [];
let lastItemFetch = 0;
const ITEM_CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Función para obtener ítems desde GitHub
const fetchItemsFromAlbion = async () => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json');
    const data = response.data;
    const filtered = data.filter(item =>
      item.LocalizedNames?.['ES-ES'] &&
      item.UniqueName &&
      !item.UniqueName.includes('QUEST') &&
      !item.UniqueName.includes('JOURNAL') &&
      !item.UniqueName.includes('TROPHY') &&
      !item.UniqueName.includes('SKIN') &&
      !item.UniqueName.includes('TEST') &&
      !item.UniqueName.includes('BLACKMARKET')
    );
    cachedItems = filtered.map(i => ({
      item_id: i.UniqueName,
      nombre: i.LocalizedNames['ES-ES'],
      imagen: `https://render.albiononline.com/v1/item/${i.UniqueName}.png`
    }));
    lastItemFetch = Date.now();
    console.log(`✅ Items precargados: ${cachedItems.length}`);
  } catch (error) {
    console.error('❌ Error al obtener ítems:', error.message);
  }
};

// Ruta: GET /api/items/all (para búsqueda global)
router.get('/items/all', async (req, res) => {
  const now = Date.now();
  if (now - lastItemFetch > ITEM_CACHE_DURATION || cachedItems.length === 0) {
    await fetchItemsFromAlbion();
  }
  res.json(cachedItems);
});

module.exports = router;
