// src/services/fetchPrices.js
const axios = require("axios");

function esReciente(fechaISO, minutos = 5) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diferencia = (ahora - fecha) / 60000; // minutos
  return diferencia <= minutos;
}

async function getPrices(itemId) {
  const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=Caerleon,Bridgewatch,Lymhurst,Martlock,Thetford,Fort Sterling,Brecilien`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const resultado = {};

    data.forEach(entry => {
      const {
        city = entry.location,
        sell_price_min,
        sell_price_min_date,
        buy_price_max,
        buy_price_max_date
      } = entry;

      if (!resultado[city]) {
        resultado[city] = { venta: [], compra: [] };
      }

      if (
        sell_price_min > 0 &&
        esReciente(sell_price_min_date)
      ) {
        resultado[city].venta.push({
          precio: sell_price_min,
          fecha: sell_price_min_date
        });
      }

      if (
        buy_price_max > 0 &&
        esReciente(buy_price_max_date)
      ) {
        resultado[city].compra.push({
          precio: buy_price_max,
          fecha: buy_price_max_date
        });
      }
    });

    // Ordenar y limitar a top 10 por tipo y ciudad
    for (const ciudad in resultado) {
      resultado[ciudad].venta = resultado[ciudad].venta
        .sort((a, b) => a.precio - b.precio)
        .slice(0, 10);

      resultado[ciudad].compra = resultado[ciudad].compra
        .sort((a, b) => b.precio - a.precio)
        .slice(0, 10);
    }

    return {
      itemId,
      actualizado: new Date().toISOString(),
      precios: resultado
    };
  } catch (error) {
    console.error("❌ Error al obtener precios:", error.message);
    return {
      itemId,
      actualizado: new Date().toISOString(),
      precios: {}
    };
  }
}

module.exports = { getPrices };
