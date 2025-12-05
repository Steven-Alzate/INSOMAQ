const { laminas, tipo_lamina } = require('../models');

// Crear una lámina
exports.crear = async (req, res) => {
  try {
    const { id_tipo, ancho, largo, stock } = req.body;

    if (!id_tipo || ancho === undefined || ancho === null || largo === undefined || largo === null) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios.',
      });
    }

    // No redondear, pasar valores directos
    const anchoNorm = (() => {
      const n = parseFloat(ancho);
      return Number.isNaN(n) ? null : n;
    })();
    const largoNorm = (() => {
      const n = parseFloat(largo);
      return Number.isNaN(n) ? null : n;
    })();

    // ---------------------------
    // verificar si ya existe una lámina igual (usando valores normalizados)
    // ---------------------------
    const laminaExistente = await laminas.findOne({
      where: {
        id_tipo,
        ancho: anchoNorm,
        largo: largoNorm
      }
    });

    if (laminaExistente) {
      // si existe, sumamos 1 (o lo que venga en stock si lo mandas)
      laminaExistente.stock += stock ? Number(stock) : 1;
      await laminaExistente.save();

      return res.json({
        message: 'Stock actualizado correctamente.',
        lamina: laminaExistente
      });
    }
    // ---------------------------
    // 🔥 FIN DEL AGREGADO
    // ---------------------------


    // Si no existe, entonces crearla (tu código original)
    const nuevaLamina = await laminas.create({
      id_tipo,
      ancho: anchoNorm,
      largo: largoNorm,
      stock: stock ?? 1
    });

    res.json({
      message: 'Lámina creada correctamente.',
      laminas: nuevaLamina,
    });
  } catch (error) {
    console.error('Error al crear lámina:', error);
    res.status(500).json({
      message: 'Ocurrió un error al crear la lámina.',
      error: error.message,
    });
  }
};


// Obtener todas las láminas
exports.obtenerTodos = async (req, res) => {
  try {
    const laminas_data = await laminas.findAll({
      include: [
        {
          model: tipo_lamina,
          attributes: ['id', 'nombre']
        }
      ]
    });
    // Mapear para incluir `tipo` y usar nombres sencillos esperados por el frontend
    const mapped = laminas_data.map(l => ({
      id: l.id,
      id_tipo: l.id_tipo,
      ancho: l.ancho,
      largo: l.largo,
      stock: l.stock,
      tipo: l.tipo_lamina ? l.tipo_lamina.nombre : null,
      fecha: l.fecha,
      hora: l.hora
    }));
    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error al obtener láminas:', err);
    res.status(500).json({ error: 'Error al obtener las láminas.' });
  }
};

// Obtener una lámina por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const lamina = await laminas.findByPk(id, {
      include: [
        {
          model: tipo_lamina,
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!lamina) {
      return res.status(404).json({ message: 'Lámina no encontrada.' });
    }

    const result = {
      id: lamina.id,
      id_tipo: lamina.id_tipo,
      ancho: lamina.ancho,
      largo: lamina.largo,
      stock: lamina.stock,
      tipo: lamina.tipo_lamina ? lamina.tipo_lamina.nombre : null,
      fecha: lamina.fecha,
      hora: lamina.hora
    };

    res.status(200).json(result);
  } catch (err) {
    console.error('Error al obtener lámina:', err);
    res.status(500).json({ error: 'Error al obtener la lámina.' });
  }
};

// Actualizar lámina
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_tipo, ancho, largo, stock } = req.body;

    if (!id_tipo || ancho === undefined || ancho === null || largo === undefined || largo === null) {
      return res.status(400).json({ error: 'Los campos id_tipo, ancho y largo son requeridos.' });
    }

    // No redondear, pasar valores directos
    const anchoNorm = (() => {
      const n = parseFloat(ancho);
      return Number.isNaN(n) ? null : n;
    })();
    const largoNorm = (() => {
      const n = parseFloat(largo);
      return Number.isNaN(n) ? null : n;
    })();

    const lamina = await laminas.findByPk(id);
    if (!lamina) {
      return res.status(404).json({ message: 'Lámina no encontrada.' });
    }

    await lamina.update({ id_tipo, ancho: anchoNorm, largo: largoNorm, stock: stock !== undefined ? stock : lamina.stock });
    res.status(200).json({ message: 'Lámina actualizada exitosamente', data: lamina });
  } catch (err) {
    console.error('Error al actualizar lámina:', err);
    res.status(500).json({ error: 'Error al actualizar la lámina.' });
  }
};

// Eliminar lámina
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const lamina = await laminas.findByPk(id);

    if (!lamina) {
      return res.status(404).json({ message: 'Lámina no encontrada.' });
    }
    // Antes de eliminar: comprobar referencias en tablas relacionadas
    const cortesCount = await require('../models').cortes.count({ where: { id_lamina: id } });
    const retazosCount = await require('../models').retazos.count({ where: { id_lamina_original: id } });

    if (cortesCount > 0 || retazosCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar la lámina: existen ${cortesCount} corte(s) y ${retazosCount} retazo(s) asociados. Elimina primero estos registros.`,
        cortesCount,
        retazosCount
      });
    }

    await lamina.destroy();
    res.status(200).json({ message: 'Lámina eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar lámina:', err);
    // Manejar constraint error para mayor claridad
    if (err && err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'No se puede eliminar la lámina porque existen registros en otras tablas que dependen de ella.' });
    }
    res.status(500).json({ error: 'Error al eliminar la lámina.' });
  }
};

// Crear o combinar (sumar) stock si ya existe una lámina con mismo tipo/ancho/largo
exports.crearOCombinar = async (req, res) => {
  try {
    const { id_tipo, ancho, largo, stock } = req.body;

    if (!id_tipo || ancho === undefined || ancho === null || largo === undefined || largo === null) {
      return res.status(400).json({ error: 'Los campos id_tipo, ancho y largo son requeridos.' });
    }

    // No redondear, pasar valores directos
    const anchoNorm = (() => {
      const n = parseFloat(ancho);
      return Number.isNaN(n) ? null : n;
    })();
    const largoNorm = (() => {
      const n = parseFloat(largo);
      return Number.isNaN(n) ? null : n;
    })();

    // Buscar si ya existe una lámina con los mismos atributos (normalizados)
    const existente = await laminas.findOne({ where: { id_tipo, ancho: anchoNorm, largo: largoNorm } });

    if (existente) {
      const suma = (Number(existente.stock) || 0) + (Number(stock) || 0);
      await existente.update({ stock: suma });
      return res.status(200).json({ message: 'Stock actualizado (suma realizado)', data: { id: existente.id, stock: suma } });
    }

    // Si no existe, crear nueva lámina
    const nueva = await laminas.create({ id_tipo, ancho: anchoNorm, largo: largoNorm, stock: stock || 0 });
    const lam = await laminas.findByPk(nueva.id, {
      include: [{ model: tipo_lamina, attributes: ['id', 'nombre'] }]
    });

    const result = {
      id: lam.id,
      id_tipo: lam.id_tipo,
      ancho: lam.ancho,
      largo: lam.largo,
      stock: lam.stock,
      tipo: lam.tipo_lamina ? lam.tipo_lamina.nombre : null,
      fecha: lam.fecha,
      hora: lam.hora
    };

    res.status(201).json({ message: 'Lámina creada exitosamente', data: result });
  } catch (err) {
    console.error('Error en crearOCombinar:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud de crear/combinar.' });
  }
};
