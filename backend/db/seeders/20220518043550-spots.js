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
          lat: 146.3,
          lng: 134.2,
          name: "Homey Dallas Home for the Homies",
          description:
            "A home once enjoyed by the homies, now available to the homies,",
          price: 50,
        },
        {
          userId: 2,
          address: "315 Hello St.",
          city: "SF",
          state: "CA",
          country: "USA",
          lat: 156.3,
          lng: 113.2,
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
