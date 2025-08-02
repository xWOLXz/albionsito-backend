const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/items', async (req, res) => {
  try {
    const response = await fetch('https://cdn.albiononline2d.com/data/latest/items.json');

    // Verifica que sea un response válido
    if (!response.ok) {
      return res.status(500).json({ error: 'Error al obtener los datos desde Albion2D' });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      return res.status(500).json({ error: 'Respuesta inesperada del servidor Albion2D (no es JSON)' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en /items:', error.message);
    res.status(500).json({ error: 'Error interno en el backend' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
