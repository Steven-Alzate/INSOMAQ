'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alertas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_lamina: {
        type: Sequelize.INTEGER,
        references: { model: 'laminas', key: 'id' }
      },
      tipo: Sequelize.ENUM('stock', 'sistema'),
      mensaje: Sequelize.TEXT,
      leida: Sequelize.BOOLEAN,
      fecha: Sequelize.DATE
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('alertas');
  }
};
