const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const ciudades = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst'];
const apiAlbion = 'https://west.albion-online-data.com/api/v2/stats/prices';
const nombresAPI = 'https://raw.githubusercontent.com/marcelo-mason/albion-data-localization/master/items.json';

app.get('/items', async (req, res) => {
  try {
    const nombresResponse = await axios.get(nombresAPI);
    const nombres = nombresResponse.data['es'];

    const encantamientos = ['']; // solo sin encantamiento
    const itemsT4 = [];

    for (const clave in nombres) {
      if (
        clave.startsWith('T4') &&
        !clave.includes('JOURNAL') &&
        !clave.includes('QUESTITEM') &&
        !clave.includes('SKIN') &&
        !clave.includes('TOKEN') &&
        !clave.includes('AVATAR')
      ) {
        encantamientos.forEach(enc => itemsT4.push(clave + enc));
      }
    }

    const url = `${apiAlbion}/${itemsT4.join(',')}?locations=${ciudades.join(',')}`;
    const response = await axios.get(url);
    const datos = response.data;

    const porItem = {};

    for (const item of datos) {
      if (!item.sell_price_min || !item.buy_price_max) continue;

      const { item_id, city, sell_price_min, buy_price_max } = item;

      if (!porItem[item_id]) {
        porItem[item_id] = {
          item_id,
          nombre: nombres[item_id] || item_id,
          icono: `https://render.albiononline.com/v1/item/${item_id}.png`,
          venta: sell_price_min,
          compra: buy_price_max,
          ciudad_venta: city,
          ciudad_compra: city,
        };
      } else {
        if (sell_price_min > porItem[item_id].venta) {
          porItem[item_id].venta = sell_price_min;
          porItem[item_id].ciudad_venta = city;
        }
        if (buy_price_max < porItem[item_id].compra) {
          porItem[item_id].compra = buy_price_max;
          porItem[item_id].ciudad_compra = city;
        }
      }
    }

    const resultados = Object.values(porItem)
      .map(item => ({
        ...item,
        ganancia: item.venta - item.compra,
      }))
      .filter(item => item.ganancia > 0)
      .sort((a, b) => b.ganancia - a.ganancia);

    res.json(resultados.slice(0, 100));
  } catch (error) {
    console.error('💥 Error en el servidor:', error.message);
    res.status(500).json({ error: 'Error en el servidor al procesar los datos' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
