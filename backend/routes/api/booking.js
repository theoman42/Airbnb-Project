const express = require("express");
const { Op } = require("sequelize");
const { Booking, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

let today = new Date();
// let dd = String(today.getDate()).padStart(2, "0");
// let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
// let yyyy = today.getFullYear();
// today = yyyy + "-" + mm + "-" + dd;

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
  if (!bookingExist) {
    let error = new Error("Booking couldn't be found");
    error.status = 404;
    throw error;
  }
  if (bookingExist.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }
  if (bookingExist.startDate < today) {
    let error = new Error("Past bookings can't be modified");
    error.status = 400;
    throw error;
  }
  const { startDate, endDate } = req.body;
  const conflict = await Booking.findAll({
    where: {
      spotId: bookingExist.spotId,
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [startDate, endDate],
          },
          endDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      ],
    },
  });
  if (conflict.length) {
    res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      statusCode: 403,
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  const booking = await bookingExist.update({
    userId: user.id,
    startDate,
    endDate,
  });

  res.json(booking);
});

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { user } = req;
  const { bookingId } = req.params;
  const deleteBooking = await Booking.findOne({
    where: { id: bookingId },
  });

  if (!deleteBooking) {
    let error = new Error("Booking couldn't be found");
    error.status = 400;
    throw error;
  }
  const owner = await Spot.findOne({
    where: { id: deleteBooking.spotId },
  });

  if (deleteBooking.userId !== user.id && owner.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }
  if (deleteBooking.startDate < today) {
    let error = new Error("Bookings that have been started can't be deleted");
    error.status = 400;
    throw error;
  }
  await deleteBooking.destroy();

  res.json({ message: "Succesfully Deleted", statusCode: 200 });
});

module.exports = router;
