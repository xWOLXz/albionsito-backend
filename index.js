const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/api/prices", async (req, res) => {
  try {
    const { items, locations, qualities } = req.query;

    if (!items || !locations || !qualities) {
      return res.status(400).json({ error: "Faltan parámetros: items, locations, qualities" });
    }

    console.log("[INFO] Solicitando precios a la API externa...");
    console.log("[INFO] Items:", items);
    console.log("[INFO] Ciudades:", locations);
    console.log("[INFO] Calidades:", qualities);

    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${items}?locations=${locations}&qualities=${qualities}`;
    console.log("[URL]", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`[OK] Datos recibidos (${data.length} resultados)`);

    res.json(data);
  } catch (error) {
    console.error("[ERROR] No se pudo obtener la información de la API externa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
});
