const axios = require("axios");

// Lista de ciudades que queremos consultar
const cities = [
  "Bridgewatch",
  "Martlock",
  "Fort Sterling",
  "Lymhurst",
  "Thetford",
  "Caerleon",
  "Brecilien"
];

/**
 * Función para obtener los últimos 5 precios de compra y venta por ciudad.
 * @param {string} itemId - ID del ítem (ejemplo: T4_BAG)
 * @returns {Promise<Array>} Lista de resultados por ciudad
 */
async function fetchAlbionData(itemId) {
  try {
    // Construir la URL de la API
    const apiUrl = `https://west.albion-online-data.com/api/v2/stats/history/${itemId}?locations=${cities.join(",")}&time-scale=1`;

    const { data } = await axios.get(apiUrl);

    // Agrupar por ciudad
    const groupedByCity = {};

    data.forEach(entry => {
      const city = entry.location;
      if (!groupedByCity[city]) {
        groupedByCity[city] = { sell: [], buy: [] };
      }

      // Guardar precios (si existen)
      if (entry.sell_price_min > 0) {
        groupedByCity[city].sell.push({
          price: entry.sell_price_min,
          timestamp: entry.timestamp
        });
      }
      if (entry.buy_price_max > 0) {
        groupedByCity[city].buy.push({
          price: entry.buy_price_max,
          timestamp: entry.timestamp
        });
      }
    });

    // Tomar solo los últimos 5 por cada ciudad
    const result = Object.entries(groupedByCity).map(([city, prices]) => ({
      city,
      last5Sell: prices.sell
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5),
      last5Buy: prices.buy
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    }));

    return result;
  } catch (error) {
    console.error("Error al obtener datos de Albion API:", error.message);
    return [];
  }
}

module.exports = fetchAlbionData;
