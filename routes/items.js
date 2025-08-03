const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ruta para obtener todos los ítems precargados desde el backend
router.get('/items/all', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json');
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
    console.error('❌ Error al obtener todos los ítems:', error.message);
    res.status(500).json({ error: 'Error al obtener todos los ítems' });
  }
});

// Obtener precios de un ítem específico
router.get('/api/precios', async (req, res) => {
  try {
    const { itemId } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'Falta itemId en la consulta' });
    }

    const response = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Bridgewatch,Martlock,Lymhurst,Fort Sterling,Thetford,Black Market, Caerleon`);
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
