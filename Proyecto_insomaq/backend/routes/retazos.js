const express = require('express');
const router = express.Router();
const retazosController = require('../controllers/retazosController');

// POST - Crear retazo
router.post('/', retazosController.crear);

// GET - Obtener todos los retazos
router.get('/', retazosController.obtenerTodos);

// GET - Obtener un retazo por ID
router.get('/:id', retazosController.obtenerPorId);

// PUT - Actualizar retazo
router.put('/:id', retazosController.actualizar);

// DELETE - Eliminar retazo
router.delete('/:id', retazosController.eliminar);

module.exports = router;
