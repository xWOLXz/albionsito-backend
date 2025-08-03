const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Esquema para los ítems (ajústalo si usas otro modelo)
const itemSchema = new mongoose.Schema({
  item_id: String,
  nombre: String,
  imagen: String,
});

const Item = mongoose.model('Item', itemSchema);

// Obtener todos los ítems para autocompletar (buscador)
router.get('/api/items/all', async (req, res) => {
  try {
    const items = await Item.find({}, { _id: 0, item_id: 1, nombre: 1, imagen: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems' });
  }
});

// Obtener ítems paginados
router.get('/api/items', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 30;
    const skip = (page - 1) * pageSize;

    const items = await Item.find({}, { _id: 0, item_id: 1, nombre: 1, imagen: 1 })
      .skip(skip)
      .limit(pageSize);

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ítems paginados' });
  }
});

// Obtener precios de un ítem específico
router.get('/api/precios', async (req, res) => {
  try {
    const { itemId } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'Falta itemId en la consulta' });
    }

    const response = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Bridgewatch,Martlock,Lymhurst,Fort Sterling,Thetford,Black Market,Caerleon`);
    const data = await response.json();

    const ventas = data.filter(entry => entry.sell_price_min > 0);
    const compras = data.filter(entry => entry.buy_price_max > 0);

    const mejorVenta = ventas.sort((a, b) => a.sell_price_min - b.sell_price_min)[0] || {};
    const mejorCompra = compras.sort((a, b) => b.buy_price_max - a.buy_price_max)[0] || {};

    res.json({
      sell: {
        price: mejorVenta.sell_price_min || 0,
        city: mejorVenta.city || 'Desconocido',
      },
      buy: {
        price: mejorCompra.buy_price_max || 0,
        city: mejorCompra.city || 'Desconocido',
      },
      margen: mejorVenta.sell_price_min && mejorCompra.buy_price_max
        ? mejorCompra.buy_price_max - mejorVenta.sell_price_min
        : 0,
    });

  } catch (error) {
    console.error('Error en /api/precios:', error);
    res.status(500).json({ error: 'No se pudieron obtener precios' });
  }
});

module.exports = router;
