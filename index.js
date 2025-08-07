const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const logs = require('log-color');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

const API_URL = 'https://west.albion-online-data.com/api/market';

app.get('/api/market', async (req, res) => {
  try {
    logs.info('[BACKEND 1] ⏳ Obteniendo ítems y ciudades desde Albion Data Project...');
    
    const cities = ['Caerleon', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Brecilien'];
    const itemsURL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';
    const response = await fetch(itemsURL);
    const itemsData = await response.json();
    const validItems = itemsData
      .filter(i => i.UniqueName && i.Tradable && !i.UniqueName.includes("QUESTITEM"))
      .map(i => i.UniqueName);

    const selectedItems = validItems.slice(0, 50); // puedes ajustar el número
    const allRequests = [];

    for (const item of selectedItems) {
      for (const city of cities) {
        const url = `${API_URL}/${item}.json?locations=${city}`;
        allRequests.push(fetch(url).then(res => res.json()));
      }
    }

    const allResults = await Promise.all(allRequests);
    const flatResults = allResults.flat().filter(entry => entry.sell_price_min > 0 || entry.buy_price_max > 0);

    logs.success(`[BACKEND 1] ✅ Datos recibidos correctamente (${flatResults.length} registros)`);
    res.json(flatResults);
  } catch (error) {
    logs.error(`[BACKEND 1] ❌ Error obteniendo datos: ${error}`);
    res.status(500).json({ error: 'Error al obtener datos del mercado.' });
  }
});

app.listen(PORT, () => {
  logs.done(`🚀 albionsito-backend corriendo en http://localhost:${PORT}`);
});
