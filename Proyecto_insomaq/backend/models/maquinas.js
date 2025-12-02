'use strict';

module.exports = (sequelize, DataTypes) => {
  const Maquinas = sequelize.define('maquinas', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
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
    tableName: 'maquinas'
  });

  Maquinas.associate = (models) => {
    Maquinas.hasMany(models.cortes, { foreignKey: 'id_maquina' });
    Maquinas.hasMany(models.retazos, { foreignKey: 'id_maquina' });
  };

  return Maquinas;
};
