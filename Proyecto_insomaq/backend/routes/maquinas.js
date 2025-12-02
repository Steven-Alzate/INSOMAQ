const express = require('express');
const router = express.Router();
const maquinasController = require('../controllers/maquinasController');

// POST - Crear máquina
router.post('/', maquinasController.crear);

// GET - Obtener todas las máquinas
router.get('/', maquinasController.obtenerTodos);

// GET - Obtener una máquina por ID
router.get('/:id', maquinasController.obtenerPorId);

// PUT - Actualizar máquina
router.put('/:id', maquinasController.actualizar);

// DELETE - Eliminar máquina
router.delete('/:id', maquinasController.eliminar);

module.exports = router;
