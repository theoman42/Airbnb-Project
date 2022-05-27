"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("Users", "firstName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    queryInterface.addColumn("Users", "lastName", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Users", "firstName");
    queryInterface.removeColumn("Users", "lastName");
    queryInterface.removeColumn("Users", "isHost");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
