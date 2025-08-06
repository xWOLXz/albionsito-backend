const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

let marketData = [];

const fetchMarketData = async () => {
  try {
    const cities = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon'];
    const qualities = [1];
    const itemsUrl = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';

    console.log(`[Backend1] ⏳ Obteniendo items...`);
    const itemsResponse = await fetch(itemsUrl);
    const items = await itemsResponse.json();

    if (!Array.isArray(items)) {
      console.error('[Backend1] ❌ El JSON de items no es un array:', items);
      return;
    }

    console.log(`[Backend1] 🧩 Total items obtenidos del JSON: ${items.length}`);

    const filteredItems = items.filter(
      item => item.tradeable && item.uniquename && !item.uniquename.includes('TEST')
    );

    const itemIds = filteredItems.map(item => item.uniquename).slice(0, 500);
    console.log(`[Backend1] ✅ Items filtrados para consultar precios: ${itemIds.length}`);

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIds.join(',')}?locations=${cities.join(',')}&qualities=${qualities.join(',')}`;
    console.log(`[Backend1] 🌐 Llamando a la API externa de precios...`);
    const response = await fetch(url);
    const data = await response.json();

    console.log(`[Backend1] 📦 Datos recibidos de la API de precios: ${data.length}`);

    const finalData = [];

    const grouped = data.reduce((acc, item) => {
      if (!acc[item.item_id]) acc[item.item_id] = [];
      acc[item.item_id].push(item);
      return acc;
    }, {});

    let procesados = 0;

    for (const [itemId, entries] of Object.entries(grouped)) {
      const sellOrders = entries.filter(e => e.sell_price_min > 0);
      const buyOrders = entries.filter(e => e.buy_price_max > 0);

      if (sellOrders.length === 0 || buyOrders.length === 0) continue;

      const lowestSell = sellOrders.reduce((min, e) => e.sell_price_min < min.sell_price_min ? e : min, sellOrders[0]);
      const highestBuy = buyOrders.reduce((max, e) => e.buy_price_max > max.buy_price_max ? e : max, buyOrders[0]);

      const profit = lowestSell.sell_price_min - highestBuy.buy_price_max;

      finalData.push({
        item_id: itemId,
        lowest_sell_price: lowestSell.sell_price_min,
        sell_city: lowestSell.city,
        highest_buy_price: highestBuy.buy_price_max,
        buy_city: highestBuy.city,
        profit
      });

      procesados++;
    }

    marketData = finalData;
    console.log(`[Backend1] ✅ Finalizado. Ítems con datos válidos: ${procesados}`);
  } catch (error) {
    console.error('[Backend1] ❌ Error en fetchMarketData:', error);
  }
};

// Ejecutar y actualizar cada 10 min
fetchMarketData();
setInterval(fetchMarketData, 10 * 60 * 1000);

app.get('/items', (req, res) => {
  console.log(`[Backend1] 📤 Petición a /items. Total: ${marketData.length}`);
  res.json(marketData);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend1 corriendo en http://localhost:${PORT}`);
});
