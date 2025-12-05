const { maquinas } = require('../models');

// Crear máquina
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo nombre es requerido.' });
    }

    // Validar que no exista una máquina con el mismo nombre
    const maquinaExistente = await maquinas.findOne({ where: { nombre: nombre.trim() } });
    if (maquinaExistente) {
      return res.status(409).json({ error: 'Ya existe una máquina con este nombre.' });
    }

    const nuevaMaquina = await maquinas.create({ nombre, descripcion: descripcion || null });
    res.status(201).json({ message: 'Máquina creada exitosamente', data: nuevaMaquina });
  } catch (err) {
    console.error('Error al crear máquina:', err);
    res.status(500).json({ error: 'Error al crear la máquina.' });
  }
};

// Obtener todas las máquinas
exports.obtenerTodos = async (req, res) => {
  try {
    const maquinas_data = await maquinas.findAll();
    res.status(200).json(maquinas_data);
  } catch (err) {
    console.error('Error al obtener máquinas:', err);
    res.status(500).json({ error: 'Error al obtener las máquinas.' });
  }
};

// Obtener una máquina por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const maquina = await maquinas.findByPk(id);

    if (!maquina) {
      return res.status(404).json({ message: 'Máquina no encontrada.' });
    }

    res.status(200).json(maquina);
  } catch (err) {
    console.error('Error al obtener máquina:', err);
    res.status(500).json({ error: 'Error al obtener la máquina.' });
  }
};

// Actualizar máquina
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo nombre es requerido.' });
    }

    const maquina = await maquinas.findByPk(id);
    if (!maquina) {
      return res.status(404).json({ message: 'Máquina no encontrada.' });
    }

    // Validar que no exista otra máquina con el mismo nombre (ignorando la actual)
    const maquinaExistente = await maquinas.findOne({ 
      where: { nombre: nombre.trim(), id: { [require('sequelize').Op.ne]: id } } 
    });
    if (maquinaExistente) {
      return res.status(409).json({ error: 'Ya existe otra máquina con este nombre.' });
    }

    await maquina.update({ nombre, descripcion: descripcion || maquina.descripcion });
    res.status(200).json({ message: 'Máquina actualizada exitosamente', data: maquina });
  } catch (err) {
    console.error('Error al actualizar máquina:', err);
    res.status(500).json({ error: 'Error al actualizar la máquina.' });
  }
};

// Eliminar máquina
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const maquina = await maquinas.findByPk(id);

    if (!maquina) {
      return res.status(404).json({ message: 'Máquina no encontrada.' });
    }

    await maquina.destroy();
    res.status(200).json({ message: 'Máquina eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar máquina:', err);
    res.status(500).json({ error: 'Error al eliminar la máquina.' });
  }
};
