const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ruta para obtener items paginados
router.get('/items', async (req, res) => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json'
    );

    const data = response.data;
    const filtered = data.filter(item =>
      item.LocalizedNames?.['ES-ES'] &&
      item.UniqueName &&
      !item.UniqueName.includes('QUEST') &&
      !item.UniqueName.includes('JOURNAL') &&
      !item.UniqueName.includes('TROPHY') &&
      !item.UniqueName.includes('SKIN') &&
      !item.UniqueName.includes('TEST') &&
      !item.UniqueName.includes('BLACKMARKET')
    );

    const page = parseInt(req.query.page) || 1;
    const perPage = 30;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    res.json({
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / perPage),
      items: paginated
    });
  } catch (error) {
    console.error('Error al obtener items:', error.message);
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

// ✅ NUEVA RUTA para traer todos los ítems (sin paginar)
router.get('/items/all', async (req, res) => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json'
    );

    const data = response.data;
    const filtered = data
      .filter(item =>
        item.LocalizedNames?.['ES-ES'] &&
        item.UniqueName &&
        !item.UniqueName.includes('QUEST') &&
        !item.UniqueName.includes('JOURNAL') &&
        !item.UniqueName.includes('TROPHY') &&
        !item.UniqueName.includes('SKIN') &&
        !item.UniqueName.includes('TEST') &&
        !item.UniqueName.includes('BLACKMARKET')
      )
      .map(item => ({
        item_id: item.UniqueName,
        nombre: item.LocalizedNames['ES-ES'],
        imagen: `https://render.albiononline.com/v1/item/${item.UniqueName}.png`
      }));

    res.json(filtered);
  } catch (error) {
    console.error('Error al obtener todos los items:', error.message);
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

module.exports = router;
