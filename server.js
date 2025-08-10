// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());

// Función para obtener precios históricos de un ítem en Albion West
async function getLast5Prices(itemId) {
  try {
    // Llamada a la API oficial (West)
    const { data } = await axios.get(
      `https://west.albion-online-data.com/api/v2/stats/history/${itemId}?time-scale=1`
    );

    // Agrupar por ciudad
    const groupedByCity = {};

    data.forEach(entry => {
      const city = entry.location;
      if (!groupedByCity[city]) {
        groupedByCity[city] = { buy: [], sell: [] };
      }

      // Guardar precios (ordenados más recientes primero)
      if (entry.buy_price_min > 0) {
        groupedByCity[city].buy.push(entry.buy_price_min);
      }
      if (entry.sell_price_min > 0) {
        groupedByCity[city].sell.push(entry.sell_price_min);
      }
    });

    // Limitar a los últimos 5 por ciudad
    Object.keys(groupedByCity).forEach(city => {
      groupedByCity[city].buy = groupedByCity[city].buy.slice(-5).reverse();
      groupedByCity[city].sell = groupedByCity[city].sell.slice(-5).reverse();
    });

    return groupedByCity;
  } catch (error) {
    console.error(`Error obteniendo precios para ${itemId}:`, error.message);
    return {};
  }
}

// Ruta para obtener los últimos 5 precios de un ítem
app.get('/api/market/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const prices = await getLast5Prices(itemId);
  res.json(prices);
});

app.listen(PORT, () => {
  console.log(`✅ Backend Market corriendo en el puerto ${PORT}`);
});
