const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/items", async (req, res) => {
  try {
    const itemListUrl = "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json";
    const { data: itemsRaw } = await axios.get(itemListUrl);

    const filteredItems = itemsRaw.filter(
      (item) =>
        item.UniqueName &&
        !item.UniqueName.includes("SKIN") &&
        !item.UniqueName.includes("QUEST") &&
        !item.UniqueName.includes("JOURNAL") &&
        !item.UniqueName.includes("TOKEN") &&
        !item.UniqueName.includes("TUTORIAL") &&
        !item.UniqueName.includes("AVATAR") &&
        !item.UniqueName.includes("GUILD") &&
        !item.UniqueName.includes("LABORER") &&
        !item.UniqueName.includes("FARMABLE") &&
        !item.UniqueName.includes("RESOURCE")
    );

    const itemIds = filteredItems.slice(0, 500).map((item) => item.UniqueName); // Puedes ajustar el límite

    const apiUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${itemIds.join(",")}?locations=Bridgewatch,Caerleon,FortSterling,Lymhurst,Martlock,Thetford`;

    const { data: prices } = await axios.get(apiUrl);

    const itemsMap = {};

    for (const entry of prices) {
      const { item_id, city, sell_price_min, buy_price_max } = entry;

      if (!itemsMap[item_id]) {
        itemsMap[item_id] = {
          id: item_id,
          nombre: item_id.replace(/_/g, " "),
          venta: sell_price_min || 0,
          ciudadVenta: city || "",
          compra: buy_price_max || 0,
          ciudadCompra: city || "",
        };
      } else {
        if (sell_price_min > 0 && sell_price_min < itemsMap[item_id].venta) {
          itemsMap[item_id].venta = sell_price_min;
          itemsMap[item_id].ciudadVenta = city;
        }

        if (buy_price_max > itemsMap[item_id].compra) {
          itemsMap[item_id].compra = buy_price_max;
          itemsMap[item_id].ciudadCompra = city;
        }
      }
    }

    const resultado = Object.values(itemsMap)
      .map((item) => ({
        ...item,
        ganancia: item.venta > 0 && item.compra > 0 ? item.venta - item.compra : 0,
      }))
      .filter((item) => item.venta > 0 && item.compra > 0)
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 30);

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    res.status(500).json({ error: "Error al obtener los precios del mercado." });
  }
});

app.get("/", (req, res) => {
  res.send("API de Albionsito funcionando correctamente (backend-principal).");
});

app.listen(PORT, () => {
  console.log(`Servidor backend-principal corriendo en puerto ${PORT}`);
});
