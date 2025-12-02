'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('retazos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_lamina_original: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'laminas', // 👈 nombre correcto de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ancho: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      largo: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      id_maquina: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'maquinas', // 👈 usa el nombre exacto de la tabla
          key: 'id_maquina'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_corte: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      engine: 'InnoDB'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('retazos');
  }
};

