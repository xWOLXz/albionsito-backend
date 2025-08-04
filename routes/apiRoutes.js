const express = require("express");
const router = express.Router();
const { getItems } = require("../services/fetchItems");
const { getPrices } = require("../services/fetchPrices");

router.get("/items", async (req, res) => {
  try {
    const items = await getItems();
    res.json(items);
  } catch (err) {
    console.error("Error al obtener ítems:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/prices/:itemId", async (req, res) => {
  try {
    const prices = await getPrices(req.params.itemId);
    res.json(prices);
  } catch (err) {
    console.error("Error al obtener precios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
