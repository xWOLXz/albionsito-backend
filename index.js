const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Ciudades oficiales del Market
const cities = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst'];

// API de Albion Data Project
const BASE_URL = 'https://www.albion-online-data.com/api/v2/stats/prices/';
const LOCALES_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';

let localizedNames = {};

async function cargarNombres() {
  try {
    const res = await axios.get(LOCALES_URL);
    for (const item of res.data) {
      if (item.LocalizedNames && item.LocalizedNames['ES-ES']) {
        localizedNames[item.UniqueName] = item.LocalizedNames['ES-ES'];
      }
    }
  } catch (err) {
    console.error('❌ Error cargando nombres en español:', err.message);
  }
}

async function obtenerItems() {
  try {
    const items = ['T4_BAG', 'T4_CAPE', 'T4_2H_BOW', 'T4_ARMOR_PLATE_SET1', 'T4_OFF_SHIELD'];

    const response = await axios.get(`${BASE_URL}${items.join(',')}.json?locations=${cities.join(',')}`);
    const data = response.data;

    // Organizar por ítem
    const agrupado = {};
    for (const entry of data) {
      if (!entry.sell_price_min || !entry.buy_price_max) continue;

      if (!agrupado[entry.item_id]) agrupado[entry.item_id] = [];

      agrupado[entry.item_id].push({
        ciudad: entry.city,
        venta: entry.sell_price_min,
        compra: entry.buy_price_max
      });
    }

    const resultado = [];

    for (const item_id in agrupado) {
      const valores = agrupado[item_id];
      const ventaMax = valores.reduce((a, b) => (a.venta > b.venta ? a : b));
      const compraMin = valores.reduce((a, b) => (a.compra < b.compra ? a : b));

      const ganancia = ventaMax.venta - compraMin.compra;

      resultado.push({
        item_id,
        nombre: localizedNames[item_id] || item_id,
        icono: `https://render.albiononline.com/v1/item/${item_id}.png`,
        ciudad_venta: ventaMax.ciudad,
        venta: ventaMax.venta,
        ciudad_compra: compraMin.ciudad,
        compra: compraMin.compra,
        ganancia
      });
    }

    return resultado.sort((a, b) => b.ganancia - a.ganancia);
  } catch (error) {
    console.error('❌ Error obteniendo datos del market:', error.message);
    return [];
  }
}

app.get('/items', async (req, res) => {
  const items = await obtenerItems();
  res.json(items);
});

cargarNombres().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor backend en puerto ${PORT}`);
  });
});
