const express = require('express');
const cors = require('cors');
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('Albionsito Backend funcionando 🎯');
});

app.use(cors());
app.use(express.json());
app.use("/", apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
