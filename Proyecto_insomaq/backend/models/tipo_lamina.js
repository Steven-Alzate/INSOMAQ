'use strict';

module.exports = (sequelize, DataTypes) => {
  const TipoLamina = sequelize.define('tipo_lamina', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    tableName: 'tipo_lamina'
  });

  TipoLamina.associate = (models) => {
    TipoLamina.hasMany(models.laminas, { foreignKey: 'id_tipo' });
  };

  return TipoLamina;
};
