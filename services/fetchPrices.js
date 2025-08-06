// albionsito-backend/services/fetchPrices.js
const axios = require("axios");
const items = require("./items.json"); // lista personalizada de ítems

const ciudades = [
  "Caerleon",
  "Bridgewatch",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Fort Sterling",
  "Brecilien",
];

function esReciente(fechaISO, minutos = 10) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diferencia = (ahora - fecha) / 60000;
  return diferencia <= minutos;
}

async function getAllPrices() {
  const itemList = items.slice(0, 50); // Puedes aumentar según capacidad
  const itemIds = itemList.map((item) => item.id).join(",");

  const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIds}.json?locations=${ciudades.join(",")}`;

  const response = await axios.get(url);
  const raw = response.data;

  const result = [];

  for (const item of itemList) {
    const entradas = raw.filter((e) => e.item_id === item.id);
    let mejorVenta = null;
    let mejorCompra = null;

    for (const e of entradas) {
      if (e.sell_price_min > 0 && esReciente(e.sell_price_min_date)) {
        if (!mejorVenta || e.sell_price_min < mejorVenta.precio) {
          mejorVenta = { ciudad: e.location, precio: e.sell_price_min };
        }
      }
      if (e.buy_price_max > 0 && esReciente(e.buy_price_max_date)) {
        if (!mejorCompra || e.buy_price_max > mejorCompra.precio) {
          mejorCompra = { ciudad: e.location, precio: e.buy_price_max };
        }
      }
    }

    if (mejorVenta || mejorCompra) {
      const margen = (mejorVenta && mejorCompra)
        ? mejorVenta.precio - mejorCompra.precio
        : 0;

      result.push({
        id: item.id,
        nombre: item.name,
        icono: item.icon,
        venta: mejorVenta,
        compra: mejorCompra,
        margen,
        actualizado: new Date().toISOString(),
      });
    }
  }

  return result;
}

module.exports = { getAllPrices };
