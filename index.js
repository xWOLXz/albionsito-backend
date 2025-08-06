const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.get('/items', async (req, res) => {
  try {
    // 1. Cargar items reales desde GitHub
    const itemsRes = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json');
    const itemsJson = await itemsRes.json();

    // 2. Filtrar solo ítems comerciables (tienen ShopCategory y no son del Black Market)
    const comerciables = itemsJson.filter(item =>
      item.UniqueName &&
      item.ShopCategory &&
      !item.UniqueName.includes('TOKEN') &&
      !item.UniqueName.includes('JOURNAL') &&
      !item.UniqueName.includes('QUESTITEM') &&
      !item.UniqueName.includes('AVATAR') &&
      !item.UniqueName.includes('TUTORIAL') &&
      !item.UniqueName.includes('EXP') &&
      !item.UniqueName.includes('SKILLBOOK')
    );

    // 3. Extraer solo los nombres únicos
    const ids = [...new Set(comerciables.map(i => i.UniqueName))].slice(0, 200); // ⚠️ Limite inicial (se puede aumentar)

    // 4. Traer precios desde la API externa
    const pricesRes = await fetch(`https://albion-online-data.com/api/v2/stats/prices?ids=${ids.join(',')}&locations=Caerleon,Bridgewatch,Lymhurst,Martlock,Thetford,Fort%20Sterling,Brecilien`);
    const prices = await pricesRes.json();

    console.log(`✅ Enviando ${prices.length} precios reales`);
    res.json(prices);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener los precios' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
