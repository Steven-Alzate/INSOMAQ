'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('retazos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_lamina_original: {
        type: Sequelize.INTEGER,
        references: { model: 'laminas', key: 'id' },
        allowNull: true
      },
      id_corte: {
        type: Sequelize.INTEGER,
        references: { model: 'cortes', key: 'id' },
        allowNull: true
      },
      ancho: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      largo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      id_maquina: {
        type: Sequelize.INTEGER,
        references: { model: 'maquinas', key: 'id' },
        allowNull: true
      },
      disponible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      hora: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('retazos');
  }
};
