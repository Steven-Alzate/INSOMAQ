const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');

// GET /alertas/low-stock?threshold=8
router.get('/low-stock', alertasController.obtenerLowStock);

// GET /alertas/
router.get('/', alertasController.obtenerTodas);

// POST /alertas/:id/leer
router.post('/:id/leer', alertasController.marcarLeida);

module.exports = router;
