'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cortes = sequelize.define('cortes', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_lamina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'laminas', key: 'id' }
    },
    ancho_cortado: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true
    },
    largo_cortado: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true
    },
    id_maquina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'maquinas', key: 'id' }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' }
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
    tableName: 'cortes'
  });

  Cortes.associate = (models) => {
    Cortes.belongsTo(models.laminas, { foreignKey: 'id_lamina' });
    Cortes.belongsTo(models.maquinas, { foreignKey: 'id_maquina' });
    Cortes.belongsTo(models.usuarios, { foreignKey: 'id_usuario' });
    Cortes.hasMany(models.retazos, { foreignKey: 'id_corte' });
  };

  return Cortes;
};
