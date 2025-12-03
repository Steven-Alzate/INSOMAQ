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
      allowNull: true
    },
    largo: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true
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
        updates[key] = data[key];
      }
    });

    await lamina.update(updates);
    return lamina;
  };

  return Laminas;
};
