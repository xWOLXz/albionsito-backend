import axios from 'axios';

export async function getItems() {
  const url = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';

  try {
    const response = await axios.get(url);

    const data = Array.isArray(response.data) ? response.data : [];

    const itemsFiltrados = data
      .filter(
        (item) =>
          item.UniqueName &&
          item.LocalizedNames?.['ES-ES'] &&
          !item.UniqueName.includes('@')
      )
      .map((item) => ({
        id: item.UniqueName,
        nombre: item.LocalizedNames['ES-ES'],
        descripcion: item.LocalizedDescriptions?.['ES-ES'] || '',
        tipo: item.ShopCategory || '',
        icono: item.UniqueName,
      }));

    console.log(`✅ ${itemsFiltrados.length} ítems obtenidos y filtrados`);
    return itemsFiltrados;

  } catch (error) {
    console.error('❌ Error al obtener items:', error.message);
    return [];
  }
}
