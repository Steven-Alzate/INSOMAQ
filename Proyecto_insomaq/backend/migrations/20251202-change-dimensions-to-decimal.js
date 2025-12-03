'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar columnas de INTEGER a DECIMAL(10,3)
    await queryInterface.changeColumn('laminas', 'ancho', { type: Sequelize.DECIMAL(10,3), allowNull: true });
    await queryInterface.changeColumn('laminas', 'largo', { type: Sequelize.DECIMAL(10,3), allowNull: true });

    await queryInterface.changeColumn('cortes', 'ancho_cortado', { type: Sequelize.DECIMAL(10,3), allowNull: true });
    await queryInterface.changeColumn('cortes', 'largo_cortado', { type: Sequelize.DECIMAL(10,3), allowNull: true });

    await queryInterface.changeColumn('retazos', 'ancho', { type: Sequelize.DECIMAL(10,3), allowNull: true });
    await queryInterface.changeColumn('retazos', 'largo', { type: Sequelize.DECIMAL(10,3), allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    // Revertir a INTEGER (por si es necesario)
    await queryInterface.changeColumn('laminas', 'ancho', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.changeColumn('laminas', 'largo', { type: Sequelize.INTEGER, allowNull: true });

    await queryInterface.changeColumn('cortes', 'ancho_cortado', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.changeColumn('cortes', 'largo_cortado', { type: Sequelize.INTEGER, allowNull: true });

    await queryInterface.changeColumn('retazos', 'ancho', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.changeColumn('retazos', 'largo', { type: Sequelize.INTEGER, allowNull: true });
  }
};
