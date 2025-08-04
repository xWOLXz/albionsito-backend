const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // ← IMPORTANTE usar node-fetch@2

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Ruta para traer los ítems comerciales
app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://west.albion-online-data.com/api/v2/stats/Prices/T4_BAG,T5_BAG,T6_BAG,T7_BAG,T8_BAG.json?locations=Caerleon,Bridgewatch,Martlock,Lymhurst,Fort%20Sterling,Thetford');
    const data = await response.json();
    
    // Filtrar los que tienen datos válidos
    const filtered = data.filter(item =>
      item.sell_price_min > 0 || item.buy_price_max > 0
    );

    res.json(filtered);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Error al obtener datos del API de Albion' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
