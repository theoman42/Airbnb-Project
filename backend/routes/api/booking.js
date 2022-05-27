const express = require("express");

const { Booking } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  const bookings = Booking.findAll({
    where: {
      userId: user.id,
    },
  });
  res.json(bookings);
});

// router.update("/:bookingId", requireAuth, async (req, res) => {
//   const { user } = req;
//   const booking = Booking.update({
//     id: bookingId,
//     userId: user.id,
//     //////NEED TO ADD SPOTID TO SLUG
//     spotId: spotId,
//   });
// });

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { user } = req;
  const { bookingId } = req.params;
  const deleteBooking = Booking.destroy({
    where: { bookingId },
  });
});

module.exports = router;
