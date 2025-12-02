const express = require('express');
const router = express.Router();
const cortesController = require('../controllers/cortesController');

// POST - Crear corte
router.post('/', cortesController.crear);

// GET - Obtener todos los cortes
router.get('/', cortesController.obtenerTodos);

// GET - Obtener cortes por mes por máquina (últimos 12 meses)
router.get('/por-mes', cortesController.obtenerPorMesMaquina);

// GET - Obtener un corte por ID
router.get('/:id', cortesController.obtenerPorId);

// PUT - Actualizar corte
router.put('/:id', cortesController.actualizar);

// DELETE - Eliminar corte
router.delete('/:id', cortesController.eliminar);

module.exports = router;
