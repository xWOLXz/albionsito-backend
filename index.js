const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const logs = require('./utils/logs');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const API_URL = 'https://west.albion-online-data.com/api/market';
const CITIES = [
  'Caerleon',
  'Bridgewatch',
  'Martlock',
  'Lymhurst',
  'Fort Sterling',
  'Thetford'
];

app.get('/api/market', async (req, res) => {
  const { itemId } = req.query;

  logs('📥 Petición recibida en /api/market', { itemId });

  if (!itemId) {
    logs('❌ Error: Falta itemId');
    return res.status(400).json({ error: 'Falta itemId en la query' });
  }

  try {
    const result = {};

    for (const city of CITIES) {
      const url = `${API_URL}/history/${itemId}.json?locations=${city}&qualities=1`;

      logs(`🌐 Consultando API para ciudad: ${city}`, url);

      const response = await fetch(url);
      const data = await response.json();

      logs(`📦 Datos recibidos de ${city}:`, data?.length || 0);

      if (!Array.isArray(data)) {
        logs(`⚠️ Respuesta inválida para ${city}`);
        result[city] = { sell: [], buy: [] };
        continue;
      }

      const sorted = data
        .filter(entry => entry && (entry.sell_price_min > 0 || entry.buy_price_max > 0))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const sellOrders = sorted
        .filter(entry => entry.sell_price_min > 0)
        .slice(0, 10)
        .map(entry => ({
          price: entry.sell_price_min,
          date: new Date(entry.timestamp * 1000).toLocaleString()
        }));

      const buyOrders = sorted
        .filter(entry => entry.buy_price_max > 0)
        .slice(0, 10)
        .map(entry => ({
          price: entry.buy_price_max,
          date: new Date(entry.timestamp * 1000).toLocaleString()
        }));

      result[city] = {
        sell: sellOrders,
        buy: buyOrders
      };

      logs(`✅ Datos procesados para ${city}`, result[city]);
    }

    logs('✅ Respuesta final construida correctamente');
    res.json(result);
  } catch (error) {
    logs('❌ Error en el backend', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  logs(`🚀 Servidor albionsito-backend iniciado en http://localhost:${PORT}`);
});
