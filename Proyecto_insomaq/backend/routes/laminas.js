const express = require('express');
const router = express.Router();
const laminasController = require('../controllers/laminasController');

// POST - Crear lámina
router.post('/', laminasController.crear);

// POST - Crear o sumar al stock si ya existe
router.post('/merge', laminasController.crearOCombinar);

// GET - Obtener todas las láminas
router.get('/', laminasController.obtenerTodos);

// GET - Obtener una lámina por ID
router.get('/:id', laminasController.obtenerPorId);

// PUT - Actualizar lámina
router.put('/:id', laminasController.actualizar);

// DELETE - Eliminar lámina
router.delete('/:id', laminasController.eliminar);

module.exports = router;
