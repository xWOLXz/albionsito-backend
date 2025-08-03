const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// ✅ Ruta paginada principal
router.get('/items', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50; // Puedes ajustar este valor

  try {
    const items = await Item.find({}, { _id: 0 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems paginados' });
  }
});

// ✅ Ruta para traer todos los ítems sin paginar (solo para búsqueda por nombre)
router.get('/items/all', async (req, res) => {
  try {
    const items = await Item.find({}, { _id: 0, item_id: 1, nombre: 1, imagen: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los ítems' });
  }
});

module.exports = router;
