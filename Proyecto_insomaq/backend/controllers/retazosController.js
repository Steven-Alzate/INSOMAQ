const { retazos, laminas, cortes, maquinas } = require('../models');

// Crear retazo
exports.crear = async (req, res) => {
  try {
    const { id_lamina_original, id_corte, ancho, largo, id_maquina, disponible } = req.body;

    if (!id_lamina_original || !ancho || !largo || !id_maquina) {
      return res.status(400).json({ error: 'Los campos id_lamina_original, ancho, largo e id_maquina son requeridos.' });
    }

    const nuevoRetazo = await retazos.create({
      id_lamina_original,
      id_corte: id_corte || null,
      ancho,
      largo,
      id_maquina,
      disponible: disponible !== undefined ? disponible : true
    });

    res.status(201).json({ message: 'Retazo creado exitosamente', data: nuevoRetazo });
  } catch (err) {
    console.error('Error al crear retazo:', err);
    res.status(500).json({ error: 'Error al crear el retazo.' });
  }
};

// Obtener todos los retazos
exports.obtenerTodos = async (req, res) => {
  try {
    const retazos_data = await retazos.findAll({
      include: [
        { model: laminas, attributes: ['id', 'ancho', 'largo'] },
        { model: cortes, attributes: ['id', 'fecha'] },
        { model: maquinas, attributes: ['id', 'nombre'] }
      ]
    });

    res.status(200).json(retazos_data);
  } catch (err) {
    console.error('Error al obtener retazos:', err);
    res.status(500).json({ error: 'Error al obtener los retazos.' });
  }
};

// Obtener un retazo por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const retazo = await retazos.findByPk(id, {
      include: [
        { model: laminas, attributes: ['id', 'ancho', 'largo'] },
        { model: cortes, attributes: ['id', 'fecha'] },
        { model: maquinas, attributes: ['id', 'nombre'] }
      ]
    });

    if (!retazo) {
      return res.status(404).json({ message: 'Retazo no encontrado.' });
    }

    res.status(200).json(retazo);
  } catch (err) {
    console.error('Error al obtener retazo:', err);
    res.status(500).json({ error: 'Error al obtener el retazo.' });
  }
};

// Actualizar retazo
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_lamina_original, id_corte, ancho, largo, id_maquina, disponible } = req.body;

    if (!id_lamina_original || !ancho || !largo || !id_maquina) {
      return res.status(400).json({ error: 'Los campos id_lamina_original, ancho, largo e id_maquina son requeridos.' });
    }

    const retazo = await retazos.findByPk(id);
    if (!retazo) {
      return res.status(404).json({ message: 'Retazo no encontrado.' });
    }

    await retazo.update({
      id_lamina_original,
      id_corte: id_corte !== undefined ? id_corte : retazo.id_corte,
      ancho,
      largo,
      id_maquina,
      disponible: disponible !== undefined ? disponible : retazo.disponible
    });

    res.status(200).json({ message: 'Retazo actualizado exitosamente', data: retazo });
  } catch (err) {
    console.error('Error al actualizar retazo:', err);
    res.status(500).json({ error: 'Error al actualizar el retazo.' });
  }
};

// Eliminar retazo
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const retazo = await retazos.findByPk(id);

    if (!retazo) {
      return res.status(404).json({ message: 'Retazo no encontrado.' });
    }

    await retazo.destroy();
    res.status(200).json({ message: 'Retazo eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar retazo:', err);
    res.status(500).json({ error: 'Error al eliminar el retazo.' });
  }
};
