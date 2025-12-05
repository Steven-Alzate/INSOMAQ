'use strict';

module.exports = (sequelize, DataTypes) => {
  const Laminas = sequelize.define('laminas', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_tipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'tipo_lamina', key: 'id' }
    },
    ancho: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      get() {
        const val = this.getDataValue('ancho');
        if (val === null || val === undefined) return null;
        const n = parseFloat(val);
        if (Number.isNaN(n)) return null;
        return n;
      },
      set(val) {
        if (val === null || val === undefined) return this.setDataValue('ancho', null);
        const n = parseFloat(val);
        if (Number.isNaN(n)) return this.setDataValue('ancho', null);
        this.setDataValue('ancho', n);
      }
    },
    largo: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      get() {
        const val = this.getDataValue('largo');
        if (val === null || val === undefined) return null;
        const n = parseFloat(val);
        if (Number.isNaN(n)) return null;
        return n;
      },
      set(val) {
        if (val === null || val === undefined) return this.setDataValue('largo', null);
        const n = parseFloat(val);
        if (Number.isNaN(n)) return this.setDataValue('largo', null);
        this.setDataValue('largo', n);
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    hora: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    tableName: 'laminas'
  });

  Laminas.associate = (models) => {
    Laminas.belongsTo(models.tipo_lamina, { foreignKey: 'id_tipo' });
    Laminas.hasMany(models.cortes, { foreignKey: 'id_lamina' });
    Laminas.hasMany(models.retazos, { foreignKey: 'id_lamina_original' });
    Laminas.hasMany(models.alertas, { foreignKey: 'id_lamina' });
  };

  /**
   * Editar una lámina por id.
   * @param {number} id - id de la lámina a editar
   * @param {object} data - campos a actualizar { id_tipo, ancho, largo, stock }
   * @returns {Promise<Model|null>} la instancia actualizada o null si no existe
   */
  Laminas.editar = async function (id, data) {
    const lamina = await Laminas.findByPk(id);
    if (!lamina) return null;

    // Sólo actualizar los campos permitidos
    const allowed = ['id_tipo', 'ancho', 'largo', 'stock'];
    const updates = {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Si se actualiza ancho/largo, parsear y pasar el valor directo
        if (key === 'ancho' || key === 'largo') {
          const raw = data[key];
          if (raw === null || raw === undefined) {
            updates[key] = null;
          } else {
            const n = parseFloat(raw);
            updates[key] = Number.isNaN(n) ? null : n;
          }
        } else {
          updates[key] = data[key];
        }
      }
    });

    await lamina.update(updates);
    return lamina;
  };

  return Laminas;
};
