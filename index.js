// albionsito-backend/index.js
const express = require("express");
const cors = require("cors");
const { getAllPrices } = require("./services/fetchPrices");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/items", async (req, res) => {
  try {
    const data = await getAllPrices();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend 1 escuchando en http://localhost:${PORT}`);
});
