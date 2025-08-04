const axios = require("axios");

let cachedItems = null;

async function getItems() {
  if (cachedItems) return cachedItems;

  const response = await axios.get("https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json");

  cachedItems = response.data.map(item => ({
    id: item.UniqueName,
    name: item.LocalizedNames?.["ES-ES"] || item.UniqueName,
    icon: `https://render.albiononline.com/v1/item/${item.UniqueName}.png`
  }));

  return cachedItems;
}

module.exports = { getItems };
