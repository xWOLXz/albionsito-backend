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

    const tiers = ['T4', 'T5', 'T6', 'T7', 'T8'];
    const encantamientos = ['', '@1', '@2', '@3', '@4'];
    const itemsFiltrados = [];

    for (const clave in nombres) {
      if (
        tiers.some(t => clave.startsWith(t)) &&
        !clave.includes('JOURNAL') &&
        !clave.includes('QUESTITEM') &&
        !clave.includes('SKIN') &&
        !clave.includes('TOKEN') &&
        !clave.includes('AVATAR')
      ) {
        encantamientos.forEach(enc => itemsFiltrados.push(clave + enc));
      }
    }

    const resultados = [];

    for (let i = 0; i < itemsFiltrados.length; i += 50) {
      const bloque = itemsFiltrados.slice(i, i + 50);
      const url = `${apiAlbion}/${bloque.join(',')}?locations=${ciudades.join(',')}`;

      try {
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

        for (const item of Object.values(porItem)) {
          item.ganancia = item.venta - item.compra;
          if (item.ganancia > 0) {
            resultados.push(item);
          }
        }

      } catch (error) {
        console.error(`Error al procesar bloque ${i}:`, error.message);
      }
    }

    resultados.sort((a, b) => b.ganancia - a.ganancia);
    res.json(resultados.slice(0, 1000));
  } catch (error) {
    console.error('Error general:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
