'use strict';

module.exports = (sequelize, DataTypes) => {
  const Alertas = sequelize.define('alertas', {
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
    tipo: {
      type: DataTypes.ENUM('stock', 'sistema'),
      allowNull: true
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    tableName: 'alertas'
  });

  Alertas.associate = (models) => {
    Alertas.belongsTo(models.laminas, { foreignKey: 'id_lamina' });
  };

  return Alertas;
};
