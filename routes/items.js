// Nueva ruta para traer todos los ítems sin paginar (solo para búsqueda)
router.get('/items/all', async (req, res) => {
  try {
    const items = await Item.find({}, { _id: 0, item_id: 1, nombre: 1, imagen: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems' });
  }
});
