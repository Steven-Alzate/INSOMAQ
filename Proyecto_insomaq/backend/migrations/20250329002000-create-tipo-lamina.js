'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_lamina', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      tipo_lamina: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      engine: 'InnoDB'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_lamina');
  }
};

