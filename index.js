const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/precios', async (req, res) => {
  const itemId = req.query.itemId;
  const ciudades = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst'];
  let buy = { price: 0, city: '' };
  let sell = { price: Infinity, city: '' };

  try {
    for (const ciudad of ciudades) {
      const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${ciudad}&qualities=1`;
      const response = await fetch(url);
      const data = await response.json();

      const ordenCompra = data.find(d => d.buy_price_max > 0);
      const ordenVenta = data.find(d => d.sell_price_min > 0);

      if (ordenCompra && ordenCompra.buy_price_max > buy.price) {
        buy = { price: ordenCompra.buy_price_max, city: ciudad };
      }

      if (ordenVenta && ordenVenta.sell_price_min < sell.price) {
        sell = { price: ordenVenta.sell_price_min, city: ciudad };
      }
    }

    const margen = buy.price - sell.price;
    res.json({ itemId, buy, sell, margen });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener precios' });
  }
});

// 🚨 Nueva ruta: items.json
app.get('/items', async (req, res) => {
  try {
    const url = 'https://cdn.albiononline2d.com/data/latest/items.json';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
