// albionsito-backend/fetchAlbionData.js

import fetch from "node-fetch";

// Función principal para obtener precios del mercado
export async function fetchAlbionData(itemIds, locations) {
  try {
    const baseUrl = "https://west.albion-online-data.com/api/v2/stats/history";
    const results = [];

    for (const itemId of itemIds) {
      const itemData = { itemId, cities: {} };

      for (const location of locations) {
        const url = `${baseUrl}/${itemId}?locations=${location}&time-scale=1`;

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Error al obtener datos para ${itemId} en ${location}`);
          continue;
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.warn(`Sin datos para ${itemId} en ${location}`);
          continue;
        }

        // Ordenar por fecha descendente
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Últimos 5 registros de venta y compra
        const last5Sell = sorted
          .filter(d => d.sell_price_min > 0)
          .slice(0, 5)
          .map(d => ({
            price: d.sell_price_min,
            date: d.timestamp
          }));

        const last5Buy = sorted
          .filter(d => d.buy_price_max > 0)
          .slice(0, 5)
          .map(d => ({
            price: d.buy_price_max,
            date: d.timestamp
          }));

        itemData.cities[location] = {
          sellPrices: last5Sell,
          buyPrices: last5Buy
        };
      }

      results.push(itemData);
    }

    return results;
  } catch (error) {
    console.error("Error en fetchAlbionData:", error);
    return [];
  }
}
