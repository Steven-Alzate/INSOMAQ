'use strict';

module.exports = (sequelize, DataTypes) => {
  const Retazos = sequelize.define('retazos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_lamina_original: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'laminas', key: 'id' }
    },
    id_corte: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'cortes', key: 'id' }
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
      allowNull: true,
      defaultValue: 1
    },
    id_maquina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'maquinas', key: 'id' }
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'retazos'
  });

  Retazos.associate = (models) => {
    Retazos.belongsTo(models.laminas, { foreignKey: 'id_lamina_original' });
    Retazos.belongsTo(models.cortes, { foreignKey: 'id_corte' });
    Retazos.belongsTo(models.maquinas, { foreignKey: 'id_maquina' });
  };

  return Retazos;
};
