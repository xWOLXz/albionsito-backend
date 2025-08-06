const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

function esReciente(fechaISO, minutos = 5) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diferencia = (ahora - fecha) / 60000; // minutos
  return diferencia <= minutos;
}

app.get('/prices', async (req, res) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
    const itemsData = await response.json();

    const itemIds = itemsData
      .filter(item =>
        item.UniqueName &&
        !item.UniqueName.includes('JOURNAL') &&
        !item.UniqueName.includes('QUESTITEM') &&
        !item.UniqueName.includes('TEST_') &&
        !item.UniqueName.includes('ARTEFACT') &&
        !item.UniqueName.includes('_SKIN') &&
        !item.UniqueName.includes('TROPHY') &&
        !item.UniqueName.includes('RANDOM') &&
        !item.UniqueName.includes('UNIQUE') &&
        !item.UniqueName.includes('TOKEN')
      )
      .map(item => item.UniqueName)
      .slice(0, 100); // puedes subir esto si tu backend lo aguanta

    const locations = ['Caerleon', 'Bridgewatch', 'Lymhurst', 'Martlock', 'Thetford', 'FortSterling', 'Brecilien'];
    const finalData = [];

    for (const itemId of itemIds) {
      const url = `https://api.albiondb.net/v1/stats/view/${itemId}?locations=${locations.join(',')}`;
      const resPrices = await fetch(url);
      const itemPrices = await resPrices.json();

      if (!itemPrices || typeof itemPrices !== 'object') continue;

      const itemResult = {
        item_id: itemId,
        locations: {}
      };

      for (const location of locations) {
        const cityData = itemPrices.locations[location];
        if (!cityData) continue;

        const sellOrders = (cityData.sell || []).filter(o => esReciente(o.timestamp));
        const buyOrders = (cityData.buy || []).filter(o => esReciente(o.timestamp));

        itemResult.locations[location] = {
          sell: sellOrders.sort((a, b) => a.price - b.price).slice(0, 10),
          buy: buyOrders.sort((a, b) => b.price - a.price).slice(0, 10)
        };
      }

      finalData.push(itemResult);
    }

    console.log('✅ Backend1 respondió con precios desde albiondb.net:', finalData.length);
    res.json(finalData);
  } catch (err) {
    console.error('❌ Error grave en backend1:', err.message);
    res.status(500).json({ error: 'Error interno en backend1' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend1 corriendo en el puerto ${PORT}`);
});
