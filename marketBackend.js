const express = require("express");
const cors = require("cors");
const fetchAlbionData = require("./fetchAlbionData");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

// Ruta principal para probar que funciona
app.get("/", (req, res) => {
  res.send("Backend Market está funcionando ✅");
});

/**
 * Ruta para obtener precios de un ítem específico
 * Ejemplo de uso desde el frontend:
 * fetch("https://TU_BACKEND_MARKET_URL/api/market/T4_BAG")
 */
app.get("/api/market/:itemId", async (req, res) => {
  const { itemId } = req.params;

  if (!itemId) {
    return res.status(400).json({ error: "Falta el parámetro itemId" });
  }

  try {
    const data = await fetchAlbionData(itemId);
    res.json({ itemId, results: data });
  } catch (error) {
    console.error("Error en /api/market:", error.message);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend Market escuchando en el puerto ${PORT}`);
});
