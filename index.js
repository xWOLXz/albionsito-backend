const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Albionsito Backend está funcionando correctamente.');
});

// NUEVA RUTA /precios para obtener precios reales desde albion-online-data.com
app.get('/precios', async (req, res) => {
  try {
    const { itemId } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'Falta el parámetro itemId' });
    }

    const response = await axios.get(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Thetford,FortSterling,Lymhurst,Bridgewatch,Martlock,BlackMarket`);

    const precios = response.data;

    const mejoresPrecios = {
      sell: { price: Infinity, city: null },
      buy: { price: 0, city: null }
    };

    for (const ciudad of precios) {
      if (ciudad.sell_price_min > 0 && ciudad.sell_price_min < mejoresPrecios.sell.price) {
        mejoresPrecios.sell = { price: ciudad.sell_price_min, city: ciudad.city };
      }

      if (ciudad.buy_price_max > mejoresPrecios.buy.price) {
        mejoresPrecios.buy = { price: ciudad.buy_price_max, city: ciudad.city };
      }
    }

    const margen = mejoresPrecios.sell.price - mejoresPrecios.buy.price;

    res.json({
      itemId,
      buy: mejoresPrecios.buy,
      sell: mejoresPrecios.sell,
      margen
    });

  } catch (error) {
    console.error('Error al consultar precios:', error.message);
    res.status(500).json({ error: 'Error al consultar los precios del mercado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
