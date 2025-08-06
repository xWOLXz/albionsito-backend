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
    const qualities = [1]; // Calidad normal
    const itemsUrl = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';

    console.log(`[Backend1] Obteniendo items...`);
    const itemsResponse = await fetch(itemsUrl);
    const items = await itemsResponse.json();

    console.log(`[Backend1] Total items obtenidos: ${items.length}`);

    const filteredItems = items.filter(
      item => item.tradeable && item.uniquename && !item.uniquename.includes('TEST')
    );

    const itemIds = filteredItems.map(item => item.uniquename).slice(0, 500); // Puedes aumentar este número
    console.log(`[Backend1] Items filtrados y válidos: ${itemIds.length}`);

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIds.join(',')}?locations=${cities.join(',')}&qualities=${qualities.join(',')}`;
    console.log(`[Backend1] Consultando precios en la API externa...`);
    const response = await fetch(url);
    const data = await response.json();

    const finalData = [];

    const grouped = data.reduce((acc, item) => {
      if (!acc[item.item_id]) acc[item.item_id] = [];
      acc[item.item_id].push(item);
      return acc;
    }, {});

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
    }

    marketData = finalData;
    console.log(`[Backend1] ✅ Datos actualizados. Total ítems con datos: ${finalData.length}`);
  } catch (error) {
    console.error('[Backend1] ❌ Error al actualizar datos del mercado:', error);
  }
};

// Ejecutar al inicio y luego cada 10 minutos
fetchMarketData();
setInterval(fetchMarketData, 10 * 60 * 1000);

// Endpoint principal
app.get('/items', (req, res) => {
  console.log(`[Backend1] 🔄 Petición recibida en /items`);
  res.json(marketData);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend1 corriendo en http://localhost:${PORT}`);
});
