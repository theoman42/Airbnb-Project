"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Spots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      country: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lat: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      lng: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Spots");
  },
};
