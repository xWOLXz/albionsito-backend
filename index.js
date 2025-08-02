// backend/index.js o donde tengas tus rutas
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://cdn.albiononline2d.com/data/latest/items.json');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener ítems:', error);
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
