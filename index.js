// albionsito-backend/index.js
const express = require("express");
const cors = require("cors");
const { getPrices } = require("./services/fetchPrices");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/api/precios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await getPrices(id);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en /api/precios:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend principal corriendo en http://localhost:${PORT}`);
});
