"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Reviews",
      [
        {
          userId: 2,
          spotId: 1,
          review: "Nice place for the homies",
          stars: 4,
        },
        {
          userId: 3,
          spotId: 2,
          review: "Nice place for the home dawgs",
          stars: 4,
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
