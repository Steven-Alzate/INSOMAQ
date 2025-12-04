const { retazos, laminas, cortes, maquinas } = require('../models');

// Crear retazo
exports.crear = async (req, res) => {
  try {
    const { id_lamina_original, id_corte, ancho, largo, id_maquina, disponible, stock } = req.body;

    if (!id_lamina_original || !ancho || !largo || !id_maquina) {
      return res.status(400).json({ error: 'Los campos id_lamina_original, ancho, largo e id_maquina son requeridos.' });
    }

    const nuevoRetazo = await retazos.create({
      id_lamina_original,
      id_corte: id_corte || null,
      ancho,
      largo,
      id_maquina,
      disponible: disponible !== undefined ? disponible : true,
      stock: stock !== undefined ? Number(stock) : 1
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

    // Mapear para incluir el nombre de la máquina
    const mapped = retazos_data.map(r => ({
      id: r.id,
      id_lamina_original: r.id_lamina_original,
      id_corte: r.id_corte,
      ancho: r.ancho,
      largo: r.largo,
      id_maquina: r.id_maquina,
      maquina: r.maquinas ? r.maquinas.nombre : null,
      disponible: r.disponible,
      stock: r.stock,
      fecha: r.fecha,
      hora: r.hora,
      laminas: r.laminas,
      cortes: r.cortes
    }));

    res.status(200).json(mapped);
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

    const mapped = {
      id: retazo.id,
      id_lamina_original: retazo.id_lamina_original,
      id_corte: retazo.id_corte,
      ancho: retazo.ancho,
      largo: retazo.largo,
      id_maquina: retazo.id_maquina,
      maquina: retazo.maquinas ? retazo.maquinas.nombre : null,
      disponible: retazo.disponible,
      stock: retazo.stock,
      fecha: retazo.fecha,
      hora: retazo.hora,
      laminas: retazo.laminas,
      cortes: retazo.cortes
    };

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error al obtener retazo:', err);
    res.status(500).json({ error: 'Error al obtener el retazo.' });
  }
};

// Actualizar retazo
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_lamina_original, id_corte, ancho, largo, id_maquina, disponible, stock } = req.body;

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
      disponible: disponible !== undefined ? disponible : retazo.disponible,
      stock: stock !== undefined ? Number(stock) : retazo.stock
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
