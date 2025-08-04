// src/services/fetchItems.js
const fetch = require('node-fetch');

async function getItems() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json');
    const data = await response.json();

    // Filtrar solo los ítems comerciables reales de tier base (ej: T4_MAIN_SWORD)
    const filtered = data.filter(item =>
      item.UniqueName &&
      item.UniqueName.startsWith('T') &&
      !item.UniqueName.includes('@') &&
      item.LocalizedNames?.['ES-ES'] &&
      item.ShopCategory // solo los comerciables
    );

    const result = filtered.map(item => ({
      id: item.UniqueName,
      nombre: item.LocalizedNames['ES-ES'],
      descripcion: item.LocalizedDescriptions?.['ES-ES'] || '',
      tipo: item.ShopCategory,
      icono: item.UniqueName
    }));

    console.log(`✅ Robados ${result.length} ítems reales`);
    return result;
  } catch (error) {
    console.error('❌ Error al obtener los items:', error.message);
    return [];
  }
}

module.exports = { getItems };
