const express = require("express");

const { Booking, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  const bookings = await Booking.findAll({
    where: {
      userId: user.id,
    },
    include: {
      model: Spot,
      attributes: [
        ["id", "id"],
        ["userId", "ownerId"],
        ["address", "address"],
        ["city", "city"],
        ["country", "country"],
        ["lat", "lat"],
        ["lng", "lng"],
        ["name", "name"],
        ["description", "description"],
        ["price", "price"],
      ],
    },
  });
  res.json({ bookings });
});

router.put("/:bookingId", requireAuth, async (req, res) => {
  let { bookingId } = req.params;
  bookingId = parseInt(bookingId);
  const { user } = req;
  const bookingExist = await Booking.findOne({ where: { id: bookingId } });
  const { startDate, endDate } = req.body;
  /*
  Spot conflict in timing.
  */
  if (!bookingExist) {
    let error = new Error("Booking couldn't be found");
    error.status = 404;
    throw error;
  }

  const booking = await Booking.update({
    userId: user.id,
    startDate,
    endDate,
  });

  res.json(booking.userId);
});

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { user } = req;
  const { bookingId } = req.params;
  const deleteBooking = Booking.destroy({
    where: { bookingId },
  });
});

module.exports = router;
