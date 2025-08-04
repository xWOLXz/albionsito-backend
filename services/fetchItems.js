import axios from 'axios';

export async function getItems() {
  const url = 'https://west.albion-online-data.com/api/v2/items';

  try {
    const response = await axios.get(url, {
      headers: {
        'Accept-Language': 'es-ES',
      },
    });

    const data = Array.isArray(response.data) ? response.data : [];

    const itemsFiltrados = data
      .filter((item) => item.UniqueName && item.ShopCategory)
      .map((item) => ({
        id: item.UniqueName,
        nombre: item.LocalizedNames?.['ES-ES'] || item.LocalizedNames?.['EN-US'] || item.UniqueName,
        descripcion: item.LocalizedDescriptions?.['ES-ES'] || '',
        tipo: item.ShopCategory,
        icono: item.UniqueName,
      }));

    console.log(`✅ ${itemsFiltrados.length} ítems obtenidos y filtrados`);
    return itemsFiltrados;

  } catch (error) {
    console.error('❌ Error al obtener los ítems:', error.message);
    return [];
  }
}
