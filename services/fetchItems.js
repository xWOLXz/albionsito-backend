const axios = require('axios');

const getItems = async () => {
  try {
    console.log('🟡 Conectando con la API principal...');

    const response = await axios.get('https://west.albion-online-data.com/api/gameinfo/items');

    if (!Array.isArray(response.data)) {
      console.error('❌ La respuesta no es un array:', typeof response.data, response.data);
      return [];
    }

    // Filtrar solo ítems comerciables reales (no decorativos, no test)
    const itemsFiltrados = response.data.filter(item => {
      return item.UniqueName &&
             !item.UniqueName.includes("TEST") &&
             !item.UniqueName.includes("UNIQUE") &&
             item.ShopCategory !== null &&
             item.LocalizedNames;
    });

    const resultado = itemsFiltrados.map(item => ({
      id: item.UniqueName,
      nombre: item.LocalizedNames?.['ES-ES'] || item.LocalizedNames?.['EN-US'] || item.UniqueName,
      descripcion: item.LocalizedDescriptions?.['ES-ES'] || '',
      tipo: item.ShopCategory,
      icono: item.UniqueName,
    }));

    console.log(`✅ Robados correctamente ${resultado.length} ítems filtrados`);
    return resultado;
  } catch (error) {
    console.error('❌ Error al obtener items:', error.message);
    return [];
  }
};

module.exports = { getItems };
