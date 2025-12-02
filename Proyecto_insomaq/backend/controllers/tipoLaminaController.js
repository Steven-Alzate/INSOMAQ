const { tipo_lamina } = require('../models');

// Crear tipo de lámina
exports.crear = async (req, res) => {
  try {
    // Aceptar tanto `nombre` como `tipo_lamina` (frontend puede enviar cualquiera)
    const nombre = req.body.nombre || req.body.tipo_lamina || req.body.tipo;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo nombre es requerido.' });
    }

    const nuevoTipo = await tipo_lamina.create({ nombre });
    // Devolver id en la raíz para que el frontend pueda usar dataTipo.id
    res.status(201).json({ id: nuevoTipo.id, tipo_lamina: nuevoTipo.nombre, message: 'Tipo de lámina creado exitosamente' });
  } catch (err) {
    console.error('Error al crear tipo de lámina:', err);
    res.status(500).json({ error: 'Error al crear el tipo de lámina.' });
  }
};

// Obtener todos los tipos de lámina
exports.obtenerTodos = async (req, res) => {
  try {
    const tipos_raw = await tipo_lamina.findAll();
    // Mapear a la forma que espera el frontend: { id, tipo_lamina }
    const tipos = tipos_raw.map(t => ({ id: t.id, tipo_lamina: t.nombre }));
    res.status(200).json(tipos);
  } catch (err) {
    console.error('Error al obtener tipos:', err);
    res.status(500).json({ error: 'Error al obtener tipos de lámina.' });
  }
};

// Obtener un tipo de lámina por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await tipo_lamina.findByPk(id);

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de lámina no encontrado.' });
    }

    res.status(200).json({ id: tipo.id, tipo_lamina: tipo.nombre });
  } catch (err) {
    console.error('Error al obtener tipo:', err);
    res.status(500).json({ error: 'Error al obtener el tipo de lámina.' });
  }
};

// Actualizar tipo de lámina
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = req.body.nombre || req.body.tipo_lamina || req.body.tipo;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo nombre es requerido.' });
    }

    const tipo = await tipo_lamina.findByPk(id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de lámina no encontrado.' });
    }

    await tipo.update({ nombre });
    res.status(200).json({ message: 'Tipo de lámina actualizado exitosamente', data: tipo });
  } catch (err) {
    console.error('Error al actualizar tipo:', err);
    res.status(500).json({ error: 'Error al actualizar el tipo de lámina.' });
  }
};

// Eliminar tipo de lámina
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await tipo_lamina.findByPk(id);

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de lámina no encontrado.' });
    }

    await tipo.destroy();
    res.status(200).json({ message: 'Tipo de lámina eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar tipo:', err);
    res.status(500).json({ error: 'Error al eliminar el tipo de lámina.' });
  }
};
