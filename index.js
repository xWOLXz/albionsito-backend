const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://cdn.albiononline2d.com/data/latest/items.json');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error cargando items:', error);
    res.status(500).json({ error: 'Error al obtener los items' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
