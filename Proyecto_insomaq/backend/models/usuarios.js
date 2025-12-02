'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define('usuarios', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    contrasena: {
      type: DataTypes.STRING,
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
    tableName: 'usuarios'
  });

  Usuarios.associate = (models) => {
    Usuarios.hasMany(models.cortes, { foreignKey: 'id_usuario' });
  };

  return Usuarios;
};
