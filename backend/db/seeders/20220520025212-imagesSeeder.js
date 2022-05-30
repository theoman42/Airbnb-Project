"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Images",
      [
        {
          spotId: 1,
          reviewId: null,
          url: "google.com/images",
        },
        {
          spotId: null,
          reviewId: 1,
          url: "google.com/images/nice",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
