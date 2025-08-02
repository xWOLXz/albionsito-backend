const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let cache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

const fetchItemsFromAPI = async () => {
  try {
    const response = await axios.get('https://west.albion-online-data.com/api/v2/stats/prices/T4_BAG,T4_CAPE,T4_MAIN_SWORD,T4_MAIN_FIRESTAFF,T4_MAIN_NATURESTAFF,T4_MAIN_CURSEDSTAFF,T4_MAIN_SPEAR,T4_MAIN_DAGGER,T4_MAIN_MACE,T4_MAIN_AXE,T4_2H_BOW,T4_2H_CROSSBOW,T4_2H_HOLYSTAFF,T4_2H_ARCANESTAFF,T4_2H_CLAYMORE,T4_2H_COMBATSTAFF,T4_2H_SCYTHE,T4_2H_HAMMER,T4_2H_QUARTERSTAFF,T4_2H_SPEAR,T4_2H_CURSEDSTAFF,T4_2H_FIRESTAFF,T4_2H_NATURESTAFF,T4_2H_SWORD,T4_2H_DAGGER,T4_2H_BOW,T4_2H_CROSSBOW,T4_2H_HOLYSTAFF,T4_2H_ARCANESTAFF,T4_HEAD_LEATHER_SET1,T4_HEAD_CLOTH_SET1,T4_HEAD_PLATE_SET1,T4_ARMOR_LEATHER_SET1,T4_ARMOR_CLOTH_SET1,T4_ARMOR_PLATE_SET1,T4_SHOES_LEATHER_SET1,T4_SHOES_CLOTH_SET1,T4_SHOES_PLATE_SET1,T4_BAG,T4_CAPE?locations=Bridgewatch,Martlock,Lymhurst,Fortsterling,Thetford,BlackMarket&qualities=1');
    cache = response.data;
    lastFetchTime = Date.now();
  } catch (error) {
    console.error('Error al obtener datos de la API externa:', error.message);
  }
};

app.get('/items', async (req, res) => {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION || cache.length === 0) {
    await fetchItemsFromAPI();
  }

  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 30;
  const start = (page - 1) * itemsPerPage;
  const paginatedItems = cache.slice(start, start + itemsPerPage);

  res.json(paginatedItems);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
