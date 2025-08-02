const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/mrzealot/ao-bin-dumps/master/items.json');
    const data = await response.json();

    const filtered = data.filter(item =>
      item.LocalizedNames &&
      item.LocalizedNames['ES-ES'] &&
      item.UniqueName &&
      !item.UniqueName.includes('TEST_') &&
      !item.UniqueName.includes('QUESTITEM') &&
      !item.UniqueName.includes('TUTORIAL') &&
      !item.UniqueName.includes('SKIN') &&
      !item.UniqueName.includes('TOKEN') &&
      !item.UniqueName.includes('JOURNAL') &&
      !item.UniqueName.includes('PLAYERITEM')
    );

    res.json(filtered);
  } catch (error) {
    console.error('❌ Error en /items:', error.message);
    res.status(500).json({ error: 'Error al obtener los datos desde GitHub' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
