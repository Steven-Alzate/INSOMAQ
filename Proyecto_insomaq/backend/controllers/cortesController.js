const db = require('../models');
const { cortes, laminas, maquinas, usuarios } = db;

// Crear corte
exports.crear = async (req, res) => {
  try {
    const { id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario } = req.body;

    if (!id_lamina || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    // Usar transacción: crear corte y decrementar stock de la lámina
    const result = await db.sequelize.transaction(async (t) => {
      // Obtener la lámina con lock FOR UPDATE
      const lam = await laminas.findByPk(id_lamina, { transaction: t, lock: t.LOCK.UPDATE });
      if (!lam) {
        throw { status: 404, message: 'Lámina no encontrada.' };
      }

      // Verificar stock disponible
      const currentStock = Number(lam.stock) || 0;
      if (currentStock <= 0) {
        throw { status: 400, message: 'No hay stock suficiente en la lámina seleccionada.' };
      }

      // Crear el corte
      const nuevoCorte = await cortes.create({
        id_lamina,
        ancho_cortado,
        largo_cortado,
        id_maquina,
        id_usuario
      }, { transaction: t });

      // Decrementar stock en 1 unidad (ajustable si se define otra regla)
      lam.stock = currentStock - 1;
      await lam.save({ transaction: t });

      return { nuevoCorte, lam };
    });

    res.status(201).json({ message: 'Corte creado exitosamente', data: result.nuevoCorte });
  } catch (err) {
    console.error('Error al crear corte:', err);
    if (err && err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error al crear el corte.' });
  }
};

// Obtener todos los cortes
exports.obtenerTodos = async (req, res) => {
  try {
    const cortes_data = await cortes.findAll({
      include: [
        { model: laminas, attributes: ['id', 'ancho', 'largo'] },
        { model: maquinas, attributes: ['id', 'nombre'] },
        { model: usuarios, attributes: ['id', 'nombre', 'email'] }
      ]
    });

    // Mapear la respuesta para facilitar el consumo en el frontend
    const mapped = cortes_data.map(c => ({
      id: c.id,
      id_lamina: c.id_lamina,
      lamina: c.laminas ? (c.laminas.tipo || `${c.laminas.largo} x ${c.laminas.ancho}`) : null,
      ancho_cortado: c.ancho_cortado,
      largo_cortado: c.largo_cortado,
      id_maquina: c.id_maquina,
      maquina: c.maquinas ? c.maquinas.nombre : null,
      id_usuario: c.id_usuario,
      usuario: c.usuarios ? c.usuarios.nombre : null,
      fecha: c.fecha,
      hora: c.hora
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error al obtener cortes:', err);
    res.status(500).json({ error: 'Error al obtener los cortes.' });
  }
};

// Obtener un corte por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const corte = await cortes.findByPk(id, {
      include: [
        { model: laminas, attributes: ['id', 'ancho', 'largo'] },
        { model: maquinas, attributes: ['id', 'nombre'] },
        { model: usuarios, attributes: ['id', 'nombre', 'email'] }
      ]
    });

    if (!corte) {
      return res.status(404).json({ message: 'Corte no encontrado.' });
    }

    res.status(200).json(corte);
  } catch (err) {
    console.error('Error al obtener corte:', err);
    res.status(500).json({ error: 'Error al obtener el corte.' });
  }
};

// Actualizar corte
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario } = req.body;

    if (!id_lamina || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    const corte = await cortes.findByPk(id);
    if (!corte) {
      return res.status(404).json({ message: 'Corte no encontrado.' });
    }

    await corte.update({ id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario });
    res.status(200).json({ message: 'Corte actualizado exitosamente', data: corte });
  } catch (err) {
    console.error('Error al actualizar corte:', err);
    res.status(500).json({ error: 'Error al actualizar el corte.' });
  }
};

// Eliminar corte
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const corte = await cortes.findByPk(id);

    if (!corte) {
      return res.status(404).json({ message: 'Corte no encontrado.' });
    }

    await corte.destroy();
    res.status(200).json({ message: 'Corte eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar corte:', err);
    res.status(500).json({ error: 'Error al eliminar el corte.' });
  }
};

// Obtener cortes por mes por máquina (últimos 12 meses)
exports.obtenerPorMesMaquina = async (req, res) => {
  try {
    // Usamos consulta raw para agrupar por máquina y mes
    const query = `
      SELECT m.id as id_maquina, m.nombre as maquina, DATE_FORMAT(c.fecha, '%Y-%m') as mes, COUNT(*) as total
      FROM cortes c
      JOIN maquinas m ON c.id_maquina = m.id
      WHERE c.fecha >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY m.id, mes
      ORDER BY mes ASC, m.id ASC
    `;

    const [results] = await db.sequelize.query(query, { type: db.Sequelize.QueryTypes.SELECT });

    // Construir lista de los últimos 12 meses ordenados ascendente
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${y}-${m}`);
    }

    // Agrupar por máquina y llenar datos por mes
    const maquinasMap = {};
    results.forEach(r => {
      const mid = r.id_maquina;
      if (!maquinasMap[mid]) maquinasMap[mid] = { id: mid, maquina: r.maquina, data: {} };
      maquinasMap[mid].data[r.mes] = Number(r.total);
    });

    const datasets = Object.values(maquinasMap).map((m, idx) => ({
      id: m.id,
      label: m.maquina || `Máquina ${m.id}`,
      data: months.map(month => m.data[month] || 0)
    }));

    res.status(200).json({ labels: months, datasets });
  } catch (err) {
    console.error('Error al obtener cortes por mes:', err);
    res.status(500).json({ error: 'Error al obtener cortes por mes.' });
  }
};
