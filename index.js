const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Lista base de ítems (puedes ampliar esto después)
const itemIDs = [
  "T4_BAG", "T4_CAPE", "T4_MAIN_SWORD", "T4_ARMOR_PLATE_SET1", "T4_HEAD_CLOTH_SET1",
  "T4_OFF_SHIELD", "T4_MAIN_FIRE", "T4_2H_CLAYMORE", "T4_2H_BOW"
];

const cities = [
  "Caerleon", "Bridgewatch", "Martlock", "Thetford", "Fort Sterling", "Lymhurst"
];

app.get('/items', async (req, res) => {
  try {
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIDs.join(',')}?locations=${cities.join(',')}&qualities=1`;
    const response = await fetch(url);
    const prices = await response.json();

    // Agrupar por item_id
    const grouped = itemIDs.map((itemId) => {
      const itemData = prices.filter(p => p.item_id === itemId && p.sell_price_min > 0 && p.buy_price_max > 0);
      if (itemData.length === 0) return null;

      // Precio mínimo de venta
      const bestSell = itemData.reduce((prev, curr) => curr.sell_price_min < prev.sell_price_min ? curr : prev);
      // Precio máximo de compra
      const bestBuy = itemData.reduce((prev, curr) => curr.buy_price_max > prev.buy_price_max ? curr : prev);

      const profit = bestSell.sell_price_min - bestBuy.buy_price_max;

      return {
        item_id: itemId,
        nombre: itemId.replace(/_/g, ' '),
        icono: `https://render.albiononline.com/v1/item/${itemId}.png`,
        ciudad_venta: bestSell.city,
        ciudad_compra: bestBuy.city,
        venta: bestSell.sell_price_min,
        compra: bestBuy.buy_price_max,
        ganancia: profit
      };
    }).filter(Boolean);

    res.json(grouped);
  } catch (err) {
    console.error('Error al obtener los datos de Albion Data Project:', err.message);
    res.status(500).json({ error: 'Fallo al obtener precios' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor Albion Backend listo en puerto ${PORT}`);
});
