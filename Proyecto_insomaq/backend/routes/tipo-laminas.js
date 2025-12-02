const express = require('express');
const router = express.Router();
const tipoLaminaController = require('../controllers/tipoLaminaController');

// POST - Crear tipo de lámina
router.post('/', tipoLaminaController.crear);

// GET - Obtener todos los tipos de lámina
router.get('/', tipoLaminaController.obtenerTodos);

// GET - Obtener un tipo de lámina por ID
router.get('/:id', tipoLaminaController.obtenerPorId);

// PUT - Actualizar tipo de lámina
router.put('/:id', tipoLaminaController.actualizar);

// DELETE - Eliminar tipo de lámina
router.delete('/:id', tipoLaminaController.eliminar);

module.exports = router;
