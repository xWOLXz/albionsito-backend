const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Error al conectar a MongoDB:', error);
  });

// Rutas
app.use('/', require('./routes/items'));
