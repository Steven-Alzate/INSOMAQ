const { laminas, tipo_lamina, alertas } = require('../models');
const { Op } = require('sequelize');

// Obtener láminas con stock bajo (threshold por query, por defecto 8)
exports.obtenerLowStock = async (req, res) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 8;

    const low = await laminas.findAll({
      where: { stock: { [Op.lte]: threshold } },
      include: [{ model: tipo_lamina, attributes: ['id', 'nombre'] }]
    });

    // Crear alertas persistentes si no existe una alerta no leída del mismo tipo
    const createdAlerts = [];
    for (const lam of low) {
      const exists = await alertas.findOne({ where: { id_lamina: lam.id, tipo: 'stock', leida: false } });
      if (!exists) {
        const mensaje = `Stock bajo (${lam.stock}) para lámina id=${lam.id}`;
        const a = await alertas.create({ id_lamina: lam.id, tipo: 'stock', mensaje, leida: false });
        createdAlerts.push({ id_lamina: lam.id, alertaId: a.id });
      }
    }

    const mapped = low.map(l => ({
      id: l.id,
      id_tipo: l.id_tipo,
      tipo: l.tipo_lamina ? l.tipo_lamina.nombre : null,
      ancho: l.ancho,
      largo: l.largo,
      stock: l.stock,
      fecha: l.fecha,
      hora: l.hora
    }));

    res.status(200).json({ threshold, count: mapped.length, laminas: mapped, createdAlerts });
  } catch (err) {
    console.error('Error al obtener alertas low-stock:', err);
    res.status(500).json({ error: 'Error al obtener alertas de stock bajo.' });
  }
};

// Obtener todas las alertas
exports.obtenerTodas = async (req, res) => {
  try {
    const rows = await alertas.findAll({
      include: [{ model: laminas, attributes: ['id', 'ancho', 'largo', 'stock'], include: [{ model: tipo_lamina, attributes: ['nombre'] }] }],
      order: [['fecha', 'DESC']]
    });

    const mapped = rows.map(r => ({
      id: r.id,
      id_lamina: r.id_lamina,
      tipo: r.tipo,
      mensaje: r.mensaje,
      leida: r.leida,
      fecha: r.fecha,
      lamina: r.lamina ? {
        id: r.lamina.id,
        tipo: r.lamina.tipo_lamina ? r.lamina.tipo_lamina.nombre : null,
        ancho: r.lamina.ancho,
        largo: r.lamina.largo,
        stock: r.lamina.stock
      } : null
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error al listar alertas:', err);
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
};

// Marcar alerta como leída
exports.marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await alertas.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Alerta no encontrada.' });
    a.leida = true;
    await a.save();
    res.status(200).json({ message: 'Alerta marcada como leída.' });
  } catch (err) {
    console.error('Error al marcar alerta leida:', err);
    res.status(500).json({ error: 'Error al actualizar alerta.' });
  }
};
