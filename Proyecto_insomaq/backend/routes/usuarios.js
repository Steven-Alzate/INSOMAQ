const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

const authenticateToken = usuariosController.authenticateToken;

// POST - Registrarse
router.post('/registrarse', usuariosController.registrarse);

// POST - Iniciar sesión
router.post('/iniciar-sesion', usuariosController.iniciarSesion);

// GET - Obtener todos los usuarios (protegido)
// GET - Obtener todos los usuarios (público)
router.get('/public', usuariosController.obtenerTodosPublic);

// GET - Obtener todos los usuarios (protegido)
router.get('/', authenticateToken, usuariosController.obtenerTodos);

// GET - Obtener un usuario por ID (protegido)
router.get('/:id', authenticateToken, usuariosController.obtenerPorId);

// PUT - Actualizar usuario (protegido)
router.put('/:id', authenticateToken, usuariosController.actualizar);

// PUT - Cambiar contraseña (protegido)
router.put('/:id/cambiar-contrasena', authenticateToken, usuariosController.cambiarContrasena);

// DELETE - Eliminar usuario (protegido)
router.delete('/:id', authenticateToken, usuariosController.eliminar);

module.exports = router;
