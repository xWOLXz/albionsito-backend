const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ITEMS_URL = 'https://cdn.albiononline2d.com/data/latest/items.json';

let allItems = [];

const filtrarItemsComerciables = (items) => {
  return items.filter(item =>
    item.UniqueName &&
    item.LocalizedNames?.['ES-ES'] &&
    !item.UniqueName.includes('JOURNAL') &&
    !item.UniqueName.includes('TRASH') &&
    !item.UniqueName.includes('QUESTITEM') &&
    !item.UniqueName.includes('T8_ROCK') &&
    !item.UniqueName.includes('T8_TREE') &&
    !item.UniqueName.includes('T8_ORE') &&
    !item.UniqueName.includes('T8_HIDE') &&
    !item.UniqueName.includes('TOKEN') &&
    !item.UniqueName.includes('SKIN') &&
    !item.UniqueName.includes('AVATAR')
  );
};

app.get('/items', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 30;

  try {
    if (allItems.length === 0) {
      const response = await fetch(ITEMS_URL);
      const data = await response.json();
      allItems = filtrarItemsComerciables(data);
    }

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageItems = allItems.slice(start, end);

    res.json({ items: pageItems });
  } catch (err) {
    console.error('Error cargando ítems:', err);
    res.status(500).json({ error: 'Error cargando ítems' });
  }
});

app.get('/precios', async (req, res) => {
  const itemId = req.query.itemId;
  if (!itemId) return res.status(400).json({ error: 'Falta itemId' });

  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json`;
    const response = await fetch(url);
    const data = await response.json();

    const ciudades = ['Bridgewatch', 'Martlock', 'Lymhurst', 'Fort Sterling', 'Thetford', 'Caerleon'];
    const sell = data
      .filter(entry => entry.sell_price_min > 0 && ciudades.includes(entry.city))
      .sort((a, b) => a.sell_price_min - b.sell_price_min)[0];

    const buy = data
      .filter(entry => entry.buy_price_max > 0 && ciudades.includes(entry.city))
      .sort((a, b) => b.buy_price_max - a.buy_price_max)[0];

    const margen = sell && buy ? sell.sell_price_min - buy.buy_price_max : 0;

    res.json({ sell: sell || {}, buy: buy || {}, margen });
  } catch (err) {
    console.error('Error cargando precios:', err);
    res.status(500).json({ error: 'Error al obtener precios' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
