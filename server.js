const express = require('express');
const app = express();
const itemsRoutes = require('./routes/items');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Montamos la ruta
app.use('/api', itemsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en el puerto ${PORT}`);
});
