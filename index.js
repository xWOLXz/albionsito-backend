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
    const qualities = [1]; // Solo calidad normal
    const itemsUrl = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';

    const itemsResponse = await fetch(itemsUrl);
    const items = await itemsResponse.json();

    const filteredItems = items.filter(
      item => item.tradeable && item.uniquename && !item.uniquename.includes('TEST')
    );

    const itemIds = filteredItems.map(item => item.uniquename).slice(0, 500); // Puedes ajustar

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIds.join(',')}?locations=${cities.join(',')}&qualities=${qualities.join(',')}`;
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

      const lowestSell = sellOrders.reduce((min, e) => e.sell_price_min < min.sell_price_min ? e : min, sellOrders[0]);
      const highestBuy = buyOrders.reduce((max, e) => e.buy_price_max > max.buy_price_max ? e : max, buyOrders[0]);

      const profit = lowestSell.sell_price_min - highestBuy.buy_price_max;

      finalData.push({
        item_id: itemId,
        lowest_sell_price: lowestSell?.sell_price_min || 0,
        sell_city: lowestSell?.city || '',
        highest_buy_price: highestBuy?.buy_price_max || 0,
        buy_city: highestBuy?.city || '',
        profit
      });
    }

    marketData = finalData;
    console.log(`[Backend1] Market data actualizado: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[Backend1] Error al actualizar datos del mercado:', error);
  }
};

// Actualizar cada 10 minutos
fetchMarketData();
setInterval(fetchMarketData, 10 * 60 * 1000);

// Endpoint principal
app.get('/items', (req, res) => {
  res.json(marketData);
});

app.listen(PORT, () => {
  console.log(`Backend1 corriendo en http://localhost:${PORT}`);
});
