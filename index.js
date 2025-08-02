const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const ciudades = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst'];
const encantamientos = ['', '@1', '@2', '@3', '@4'];
const tiers = ['T4', 'T5', 'T6', 'T7', 'T8'];

app.get('/items', async (req, res) => {
  try {
    const nombresAPI = 'https://raw.githubusercontent.com/marcelo-mason/albion-data-localization/master/items.json';
    const nombresResponse = await axios.get(nombresAPI);
    const nombres = nombresResponse.data['es'];

    // 🧠 Generamos combinaciones por defecto T4-T5 sin romper el servidor
    const itemsBase = ['BAG', 'CAPE', '2H_BOW', 'ARMOR_PLATE_SET1', 'HEAD_PLATE_SET1', 'SHOES_PLATE_SET1', 'MAIN_SWORD', 'OFF_SHIELD', '2H_FIRESTAFF', '2H_CROSSBOW'];

    const combinaciones = [];
    for (let tier of tiers) {
      for (let base of itemsBase) {
        for (let enc of encantamientos) {
          combinaciones.push(`${tier}_${base}${enc}`);
        }
      }
    }

    // 🔄 Límite para no explotar Render (100 ítems por página)
    const PAGE = parseInt(req.query.page || 1);
    const LIMIT = 100;
    const start = (PAGE - 1) * LIMIT;
    const end = PAGE * LIMIT;
    const itemsPagina = combinaciones.slice(start, end);

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemsPagina.join(',')}?locations=${ciudades.join(',')}`;
    const response = await axios.get(url);
    const datos = response.data;

    const porItem = {};

    for (const item of datos) {
      const { item_id, city, sell_price_min, buy_price_max } = item;
      if (!sell_price_min || !buy_price_max) continue;

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

    res.json(resultados);
  } catch (error) {
    console.error('💥 Backend Error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en puerto ${PORT}`);
});
