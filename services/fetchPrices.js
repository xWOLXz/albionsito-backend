const axios = require("axios");

async function getPrices(itemId) {
  const apiURL = `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json`;

  try {
    const response = await axios.get(apiURL);
    return response.data;
  } catch (err) {
    console.warn("Fallo al obtener precios del ítem:", itemId);
    return [];
  }
}

module.exports = { getPrices };
