const { usuarios, cortes } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'token12345';

// Middleware para proteger rutas
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token faltante' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Registrarse
exports.registrarse = async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: 'Los campos nombre, email y contrasena son requeridos.' });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await usuarios.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const nuevoUsuario = await usuarios.create({
      nombre,
      email,
      contrasena: hashedPassword
    });

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registro exitoso',
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      },
      token
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};

// Iniciar sesión
exports.iniciarSesion = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario por email
    const usuario = await usuarios.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: `Login exitoso. Bienvenido ${usuario.nombre}`,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      },
      token
    });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

// Obtener todos los usuarios (protegido)
exports.obtenerTodos = async (req, res) => {
  try {
    const usuarios_data = await usuarios.findAll({
      attributes: ['id', 'nombre', 'email', 'fecha'],
      include: [
        {
          model: cortes,
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json(usuarios_data);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

// Obtener todos los usuarios (público) - no requiere token
exports.obtenerTodosPublic = async (req, res) => {
  try {
    const usuarios_data = await usuarios.findAll({
      attributes: ['id', 'nombre', 'email', 'fecha']
    });

    res.status(200).json(usuarios_data);
  } catch (err) {
    console.error('Error al obtener usuarios (public):', err);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

// Obtener un usuario por ID (protegido)
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarios.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'fecha']
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(usuario);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};

// Actualizar usuario (protegido)
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    const usuario = await usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;

    await usuario.save();
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// Cambiar contraseña (protegido)
exports.cambiarContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { contrasenayActual, nuevaContrasena } = req.body;

    if (!contrasenayActual || !nuevaContrasena) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas.' });
    }

    const usuario = await usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(contrasenayActual, usuario.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
};

// Eliminar usuario (protegido)
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.destroy();
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};

exports.authenticateToken = authenticateToken;
