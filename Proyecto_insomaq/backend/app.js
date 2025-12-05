const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

// Importar modelos
const { sequelize } = require('./models');

// Importar rutas
const laminasRoutes = require('./routes/laminas');
const tipoLaminaRoutes = require('./routes/tipo-laminas');
const maquinasRoutes = require('./routes/maquinas');
const usuariosRoutes = require('./routes/usuarios');
const retazosRoutes = require('./routes/retazos');
const cortesRoutes = require('./routes/cortes');
const alertasRoutes = require('./routes/alertas');

// Rutas
app.use(express.static('public'));
app.use('/laminas', laminasRoutes);
app.use('/tipo-laminas', tipoLaminaRoutes);
app.use('/maquinas', maquinasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/retazos', retazosRoutes);
app.use('/cortes', cortesRoutes);
app.use('/alertas', alertasRoutes);

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor después de sincronizar BD
sequelize.sync({ alter: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Servidor backend corriendo en http://localhost:${port}`);
      console.log(`Conexión a la base de datos establecida con éxito.`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar la base de datos:', err);
    process.exit(1);
  });

