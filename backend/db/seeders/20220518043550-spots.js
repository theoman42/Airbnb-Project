"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Spots",
      [
        {
          userId: 1,
          address: "314 Hello St.",
          city: "Dallas",
          state: "TX",
          country: "USA",
          lat: 38.8951,
          lng: -77.0364,
          name: "Homey Dallas Home for the Homies",
          description:
            "A home once enjoyed by the homies, now available to the homies,",
          price: 50.93,
        },
        {
          userId: 2,
          address: "315 Hello St.",
          city: "SF",
          state: "CA",
          country: "USA",
          lat: 38.8951,
          lng: -79.0364,
          name: "Homey SF Home for the Homies",
          description:
            "A home once SF lalal by the homies, now available to the homies,",
          price: 50.93,
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
