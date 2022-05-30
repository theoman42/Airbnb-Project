"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Bookings",
      [
        {
          userId: 1,
          spotId: 2,
          startDate: "2014-01-12",
          endDate: "2014-01-20",
        },
        {
          userId: 2,
          spotId: 1,
          startDate: "2014-01-03",
          endDate: "2014-01-09",
        },
        {
          userId: 3,
          spotId: 2,
          startDate: "2014-01-01",
          endDate: "2014-01-05",
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
