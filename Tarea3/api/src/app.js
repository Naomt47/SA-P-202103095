const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const ciRoutes = require('./routes/ciRoutes');
const relacionRoutes = require('./routes/relacionRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.use('/cmdb/cis', ciRoutes);
app.use('/cmdb/relaciones', relacionRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;