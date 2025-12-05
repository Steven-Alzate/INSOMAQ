const mysql = require('mysql2');

// Crear la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',      
  user: 'root',           
  password: '123456',
  database: 'laminas' 
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión a la base de datos establecida con éxito.');
});

// Exportar la conexión para usarla en otros archivos
module.exports = connection;

