// ✅ BACKEND (archivo: routes/items.js)
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache para ítems y precios
let cachedItems = [];
let lastItemFetch = 0;
const ITEM_CACHE_DURATION = 15 * 60 * 1000;

let lastPrices = {};
let lastPriceFetch = {};

// Cargar todos los ítems desde GitHub
const fetchItemsFromAlbion = async () => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json'
    );
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
    cachedItems = filtered;
    lastItemFetch = Date.now();
    console.log(`✅ Items cacheados: ${cachedItems.length}`);
  } catch (error) {
    console.error('❌ Error al obtener ítems:', error.message);
  }
};

// Ruta: obtener todos los ítems sin paginación
router.get('/items/all', async (req, res) => {
  if (Date.now() - lastItemFetch > ITEM_CACHE_DURATION || cachedItems.length === 0) {
    await fetchItemsFromAlbion();
  }
  res.json(cachedItems);
});

// Ruta: obtener precios
router.get('/precios', async (req, res) => {
  const itemId = req.query.itemId;
  if (!itemId) return res.status(400).json({ error: 'Falta itemId' });

  const now = Date.now();
  const cacheValid = lastPrices[itemId] && (now - lastPriceFetch[itemId] < 5 * 60 * 1000);
  if (cacheValid) return res.json(lastPrices[itemId]);

  try {
    const cities = ["Bridgewatch", "Martlock", "Lymhurst", "FortSterling", "Thetford", "Caerleon", "Brecilien"];
    const qualities = 1;

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${cities.join(',')}&qualities=${qualities}`;
    const response = await axios.get(url);
    const data = response.data;

    const validSell = data.filter(e => e.sell_price_min > 0);
    const validBuy = data.filter(e => e.buy_price_max > 0);

    const bestSell = validSell.sort((a, b) => a.sell_price_min - b.sell_price_min)[0];
    const bestBuy = validBuy.sort((a, b) => b.buy_price_max - a.buy_price_max)[0];

    const result = {
      itemId,
      sell: bestSell ? { price: bestSell.sell_price_min, city: bestSell.city } : { price: 0, city: null },
      buy: bestBuy ? { price: bestBuy.buy_price_max, city: bestBuy.city } : { price: 0, city: null },
      margen: (bestSell && bestBuy) ? bestBuy.buy_price_max - bestSell.sell_price_min : 0
    };

    lastPrices[itemId] = result;
    lastPriceFetch[itemId] = now;

    res.json(result);
  } catch (error) {
    console.error(`❌ Error al obtener precios de ${itemId}:`, error.message);
    res.status(500).json({ error: 'Error obteniendo precios' });
  }
});

module.exports = router;
