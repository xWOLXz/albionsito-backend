const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/items', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
    const data = response.data;

    const items = data
      .filter(item => item.UniqueName && item.LocalizedNames?.["ES-ES"])
      .map(item => ({
        id: item.UniqueName,
        nombre: item.LocalizedNames["ES-ES"],
        imagen: `https://render.albiononline.com/v1/item/${item.UniqueName}.png`
      }));

    res.json(items);
  } catch (error) {
    console.error('Error al obtener los ítems:', error);
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
