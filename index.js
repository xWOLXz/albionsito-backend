const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

let marketData = [];

const fetchMarketData = async () => {
  console.log('[Backend1] ⏳ Obteniendo items...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json');
    const data = await res.json();

    const items = Object.values(data).filter(item => {
      const name = item.localizedNames?.['ES-ES'] || item.localizedNames?.['EN-US'];
      return (
        name &&
        !item.uniquename.includes('SKINS') &&
        !item.uniquename.includes('QUESTITEM') &&
        !item.uniquename.includes('TOKEN') &&
        !item.uniquename.includes('SILVER') &&
        !item.uniquename.includes('AVATAR') &&
        !item.uniquename.includes('TROPHY_FURNITURE') &&
        !item.uniquename.includes('FISH') &&
        !item.uniquename.includes('FIBER') &&
        !item.uniquename.includes('LOG') &&
        !item.uniquename.includes('ORE') &&
        !item.uniquename.includes('HIDE') &&
        !item.uniquename.includes('STONE') &&
        !item.uniquename.includes('ESSENCE') &&
        !item.uniquename.includes('JOURNAL') &&
        !item.uniquename.includes('FURNITUREITEM') &&
        !item.uniquename.includes('CAPEITEM_FW') &&
        !item.uniquename.includes('LABORER')
      );
    });

    console.log(`[Backend1] ✅ Total items filtrados: ${items.length}`);
    const preview = items.slice(0, 10).map(item => ({
      name: item.localizedNames?.['ES-ES'] || item.localizedNames?.['EN-US'] || 'SinNombre',
      id: item.uniquename
    }));
    console.log('[Backend1] 🔍 Ejemplo de items cargados:', preview);

    // Limitar a primeros 100 para evitar bloqueos en Render
    const itemsLimit = items.slice(0, 100);

    const cityList = ['Bridgewatch', 'Martlock', 'Lymhurst', 'Thetford', 'Fort Sterling'];
    const requests = [];

    for (const item of itemsLimit) {
      for (const city of cityList) {
        const url = `https://west.albion-online-data.com/api/v2/stats/prices/${item.uniquename}.json?locations=${city}`;
        requests.push(fetch(url).then(res => res.json()));
      }
    }

    const results = await Promise.all(requests);
    const flatResults = results.flat();

    marketData = [];

    for (const item of itemsLimit) {
      const prices = flatResults.filter(i => i.item_id === item.uniquename && i.sell_price_min > 0 && i.buy_price_max > 0);
      if (prices.length === 0) continue;

      const bestSell = prices.reduce((min, p) => (p.sell_price_min < min.sell_price_min ? p : min));
      const bestBuy = prices.reduce((max, p) => (p.buy_price_max > max.buy_price_max ? p : max));

      const margin = bestSell.sell_price_min - bestBuy.buy_price_max;

      const nameES = item.localizedNames?.['ES-ES'] || item.localizedNames?.['EN-US'] || 'SinNombre';

      marketData.push({
        name: nameES,
        id: item.uniquename,
        sell_price: bestSell.sell_price_min,
        sell_city: bestSell.city,
        buy_price: bestBuy.buy_price_max,
        buy_city: bestBuy.city,
        margin
      });
    }

    console.log(`[Backend1] ✅ Datos del market generados: ${marketData.length} ítems con info válida`);

  } catch (error) {
    console.error('[Backend1] ❌ Error en fetchMarketData:', error);
  }
};

app.get('/items', (req, res) => {
  console.log('[Backend1] 📦 Respuesta enviada con', marketData.length, 'ítems');
  res.json(marketData);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend1 corriendo en http://localhost:${PORT}`);
  fetchMarketData();
  setInterval(fetchMarketData, 1000 * 60 * 10); // cada 10 minutos
});
