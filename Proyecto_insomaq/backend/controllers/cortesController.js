const db = require('../models');
const { cortes, laminas, maquinas, usuarios, retazos, tipo_lamina } = db;

// Crear corte
exports.crear = async (req, res) => {
  try {
    const { id_lamina, id_retazo, ancho_cortado, largo_cortado, id_maquina, id_usuario } = req.body;

    if ((!id_lamina && !id_retazo) || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos. Se necesita id_lamina o id_retazo.' });
    }

    // Si viene id_retazo, cortamos desde retazo. Si no, desde lámina.
    const result = await db.sequelize.transaction(async (t) => {
      if (id_retazo) {
        // Cortar desde retazo
        const rz = await retazos.findByPk(id_retazo, { transaction: t, lock: t.LOCK.UPDATE });
        if (!rz) throw { status: 404, message: 'Retazo no encontrado.' };
        if (!rz.disponible) throw { status: 400, message: 'Retazo no disponible.' };

        const anchoRetazoNum = Number(rz.ancho) || 0;
        const largoRetazoNum = Number(rz.largo) || 0;
        if (Number(ancho_cortado) > anchoRetazoNum || Number(largo_cortado) > largoRetazoNum) {
          throw { status: 400, message: 'Las medidas solicitadas superan las dimensiones del retazo seleccionado.' };
        }

        // Crear corte vinculando la lámina original (para mantener compatibilidad)
        const nuevoCorte = await cortes.create({
          id_lamina: rz.id_lamina_original,
          id_retazo: id_retazo,
          ancho_cortado,
          largo_cortado,
          id_maquina,
          id_usuario
        }, { transaction: t });

        // Marcar el retazo original como no disponible y vincular al corte
        rz.disponible = false;
        rz.id_corte = nuevoCorte.id;
        await rz.save({ transaction: t });

        // Generar posibles retazos sobrantes a partir del retazo original
        const candidates = [];
        const rightAncho = anchoRetazoNum - Number(ancho_cortado);
        if (rightAncho > 0 && Number(largo_cortado) > 0) candidates.push({ ancho: rightAncho, largo: Number(largo_cortado) });
        const bottomAncho = anchoRetazoNum - Number(ancho_cortado);
        const bottomLargo = largoRetazoNum - Number(largo_cortado);
        if (bottomLargo > 0 && bottomAncho > 0) candidates.push({ ancho: bottomAncho, largo: bottomLargo });

        const seen = new Set();
        const unique = [];
        for (const c of candidates) {
          const key = `${Number(c.ancho).toFixed(6)}_${Number(c.largo).toFixed(6)}`;
          if (!seen.has(key)) { seen.add(key); unique.push(c); }
        }

        if (unique.length > 0) {
          let chosen = unique[0];
          if (unique.length > 1) {
            chosen = unique.reduce((max, cur) => {
              const areaCur = Number(cur.ancho) * Number(cur.largo);
              const areaMax = Number(max.ancho) * Number(max.largo);
              return areaCur > areaMax ? cur : max;
            }, unique[0]);
          }

          await retazos.create({
            id_lamina_original: rz.id_lamina_original,
            id_corte: nuevoCorte.id,
            ancho: chosen.ancho,
            largo: chosen.largo,
            id_maquina: id_maquina,
            disponible: true
          }, { transaction: t });
        }

        return { nuevoCorte };
      } else {
        // Cortar desde lámina (comportamiento previo)
        const lam = await laminas.findByPk(id_lamina, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lam) throw { status: 404, message: 'Lámina no encontrada.' };

        const currentStock = Number(lam.stock) || 0;
        if (currentStock <= 0) throw { status: 400, message: 'No hay stock suficiente en la lámina seleccionada.' };

        const anchoLaminaNum = Number(lam.ancho) || 0;
        const largoLaminaNum = Number(lam.largo) || 0;
        if (Number(ancho_cortado) > anchoLaminaNum || Number(largo_cortado) > largoLaminaNum) {
          throw { status: 400, message: 'Las medidas solicitadas superan las dimensiones de la lámina seleccionada.' };
        }

        const nuevoCorte = await cortes.create({ id_lamina, ancho_cortado, largo_cortado, id_maquina, id_usuario }, { transaction: t });

        const candidates = [];
        const anchoCortadoNum = Number(ancho_cortado) || 0;
        const largoCortadoNum = Number(largo_cortado) || 0;
        const rightAncho = anchoLaminaNum - anchoCortadoNum;
        if (rightAncho > 0 && largoCortadoNum > 0) candidates.push({ ancho: rightAncho, largo: largoCortadoNum });
        const bottomAncho = anchoLaminaNum - anchoCortadoNum;
        const bottomLargo = largoLaminaNum - largoCortadoNum;
        if (bottomLargo > 0 && bottomAncho > 0) candidates.push({ ancho: bottomAncho, largo: bottomLargo });

        const seen = new Set();
        const unique = [];
        for (const c of candidates) {
          const key = `${Number(c.ancho).toFixed(6)}_${Number(c.largo).toFixed(6)}`;
          if (!seen.has(key)) { seen.add(key); unique.push(c); }
        }

        if (unique.length > 0) {
          let chosen = unique[0];
          if (unique.length > 1) {
            chosen = unique.reduce((max, cur) => {
              const areaCur = Number(cur.ancho) * Number(cur.largo);
              const areaMax = Number(max.ancho) * Number(max.largo);
              return areaCur > areaMax ? cur : max;
            }, unique[0]);
          }

          await retazos.create({ id_lamina_original: lam.id, id_corte: nuevoCorte.id, ancho: chosen.ancho, largo: chosen.largo, id_maquina: id_maquina, disponible: true }, { transaction: t });
        }

        lam.stock = currentStock - 1;
        await lam.save({ transaction: t });

        return { nuevoCorte, lam };
      }
    });

    res.status(201).json({ message: 'Corte creado exitosamente', data: result.nuevoCorte || result.nuevoCorte });
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
        { model: laminas, attributes: ['id', 'ancho', 'largo'], include: [{ model: tipo_lamina, attributes: ['id', 'nombre'] }] },
        { model: maquinas, attributes: ['id', 'nombre'] },
        { model: usuarios, attributes: ['id', 'nombre', 'email'] }
      ]
    });

    // Mapear la respuesta para facilitar el consumo en el frontend
    const mapped = cortes_data.map(c => ({
      id: c.id,
      id_lamina: c.id_lamina,
      id_retazo: c.id_retazo || null,
      lamina: c.laminas ? (c.laminas.tipo_lamina && c.laminas.tipo_lamina.nombre ? c.laminas.tipo_lamina.nombre : `${c.laminas.largo} x ${c.laminas.ancho}`) : null,
      maquina: c.maquinas ? c.maquinas.nombre : null,
      ancho_cortado: c.ancho_cortado,
      largo_cortado: c.largo_cortado,
      id_maquina: c.id_maquina,
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
        { model: laminas, attributes: ['id', 'ancho', 'largo'], include: [{ model: tipo_lamina, attributes: ['id', 'nombre'] }] },
        { model: maquinas, attributes: ['id', 'nombre'] },
        { model: usuarios, attributes: ['id', 'nombre', 'email'] }
      ]
    });

    if (!corte) {
      return res.status(404).json({ message: 'Corte no encontrado.' });
    }

    const mapped = {
      id: corte.id,
      id_lamina: corte.id_lamina,
      id_retazo: corte.id_retazo,
      lamina: corte.laminas ? (corte.laminas.tipo_lamina && corte.laminas.tipo_lamina.nombre ? corte.laminas.tipo_lamina.nombre : `${corte.laminas.largo} x ${corte.laminas.ancho}`) : null,
      ancho_cortado: corte.ancho_cortado,
      largo_cortado: corte.largo_cortado,
      id_maquina: corte.id_maquina,
      maquina: corte.maquinas ? corte.maquinas.nombre : null,
      id_usuario: corte.id_usuario,
      usuario: corte.usuarios ? corte.usuarios.nombre : null,
      fecha: corte.fecha,
      hora: corte.hora
    };
    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error al obtener corte:', err);
    res.status(500).json({ error: 'Error al obtener el corte.' });
  }
};

// Actualizar corte
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_lamina, id_retazo, ancho_cortado, largo_cortado, id_maquina, id_usuario } = req.body;

    if ((!id_lamina && !id_retazo) || !ancho_cortado || !largo_cortado || !id_maquina || !id_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos. Se necesita id_lamina o id_retazo.' });
    }

    const corte = await cortes.findByPk(id);
    if (!corte) {
      return res.status(404).json({ message: 'Corte no encontrado.' });
    }

    // Si se actualiza con lámina, validar las medidas
    if (id_lamina) {
      const lam = await laminas.findByPk(id_lamina);
      if (!lam) {
        return res.status(404).json({ error: 'Lámina no encontrada.' });
      }
      const anchoLamina = Number(lam.ancho) || 0;
      const largoLamina = Number(lam.largo) || 0;
      if (Number(ancho_cortado) > anchoLamina || Number(largo_cortado) > largoLamina) {
        return res.status(400).json({ error: 'Las medidas solicitadas superan las dimensiones de la lámina seleccionada.' });
      }
    }

    // Si se actualiza con retazo, validar las medidas
    if (id_retazo) {
      const rz = await retazos.findByPk(id_retazo);
      if (!rz) {
        return res.status(404).json({ error: 'Retazo no encontrado.' });
      }
      const anchoRetazo = Number(rz.ancho) || 0;
      const largoRetazo = Number(rz.largo) || 0;
      if (Number(ancho_cortado) > anchoRetazo || Number(largo_cortado) > largoRetazo) {
        return res.status(400).json({ error: 'Las medidas solicitadas superan las dimensiones del retazo seleccionado.' });
      }
    }

    await corte.update({ id_lamina, id_retazo, ancho_cortado, largo_cortado, id_maquina, id_usuario });
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
