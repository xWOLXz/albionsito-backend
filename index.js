const express = require('express');
const cors = require('cors');
const itemsRoutes = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('Albionsito Backend funcionando 🎯');
});

// Ruta para obtener los ítems
app.use('/api/items', itemsRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend iniciado en http://localhost:${PORT}`);
});
