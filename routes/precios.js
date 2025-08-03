const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { itemId } = req.query;

  if (!itemId) return res.status(400).json({ error: 'Falta el itemId' });

  try {
    const response = await axios.get(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json`);
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener precios:', error.message);
    res.status(500).json({ error: 'Error al obtener precios del item' });
  }
});

module.exports = router;
