const axios = require('axios');

const getItems = async () => {
  try {
    console.log('🔄 Robando items desde west.albion-online-data.com');
    
    const response = await axios.get('https://west.albion-online-data.com/api/gameinfo/items');

    if (!Array.isArray(response.data)) {
      console.error('❌ La respuesta no es un array:', response.data);
      return [];
    }

    const items = response.data.map(item => ({
      id: item.UniqueName,
      nombre: item.LocalizedNames?.['ES-ES'] || item.LocalizedNames?.['EN-US'] || item.UniqueName,
      descripcion: item.LocalizedDescriptions?.['ES-ES'] || '',
      tipo: item.ShopCategory,
      icono: item.UniqueName, // Aquí no se arma URL aún, se usa para render más adelante
    }));

    console.log(`✅ Robados ${items.length} items`);
    return items;
  } catch (error) {
    console.error('❌ Error al obtener items:', error.message);
    return [];
  }
};

module.exports = { getItems };
