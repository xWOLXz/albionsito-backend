const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/mrzealot/ao-bin-dumps/master/items.json');
    const data = await response.json();

    const filtered = data.filter(item =>
      item.LocalizedNames &&
      item.LocalizedNames['ES-ES'] &&
      item.UniqueName &&
      !item.UniqueName.includes('TEST_') &&
      !item.UniqueName.includes('QUESTITEM') &&
      !item.UniqueName.includes('TUTORIAL') &&
      !item.UniqueName.includes('SKIN') &&
      !item.UniqueName.includes('TOKEN') &&
      !item.UniqueName.includes('JOURNAL') &&
      !item.UniqueName.includes('PLAYERITEM')
    );

    res.json(filtered);
  } catch (error) {
    console.error('Error en /items:', error.message);
    res.status(500).json({ error: 'Error al obtener los datos desde GitHub' });
  }
});

app.get('/precios', async (req, res) => {
  const { itemId } = req.query;
  if (!itemId) return res.status(400).json({ error: 'Falta itemId' });

  try {
    const cities = ['Bridgewatch', 'Martlock', 'Lymhurst', 'Thetford', 'Fort Sterling'];
    const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${cities.join(',')}`;
    const response = await fetch(url);
    const data = await response.json();

    const sell = data
      .filter(e => e.sell_price_min > 0)
      .sort((a, b) => a.sell_price_min - b.sell_price_min)[0];

    const buy = data
      .filter(e => e.buy_price_max > 0)
      .sort((a, b) => b.buy_price_max - a.buy_price_max)[0];

    const margen = sell && buy ? sell.sell_price_min - buy.buy_price_max : 0;

    res.json({
      sell: sell ? { price: sell.sell_price_min, city: sell.city } : null,
      buy: buy ? { price: buy.buy_price_max, city: buy.city } : null,
      margen
    });
  } catch (error) {
    console.error('Error en /precios:', error.message);
    res.status(500).json({ error: 'Error al obtener precios' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
