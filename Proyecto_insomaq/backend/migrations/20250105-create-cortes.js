'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cortes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_lamina: {
        type: Sequelize.INTEGER,
        references: { model: 'laminas', key: 'id' },
        allowNull: true
      },
      ancho_cortado: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      largo_cortado: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      id_maquina: {
        type: Sequelize.INTEGER,
        references: { model: 'maquinas', key: 'id' },
        allowNull: true
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
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
    await queryInterface.dropTable('cortes');
  }
};
