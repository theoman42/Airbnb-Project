const express = require("express");

const { check } = require("express-validator");

const { Spot, Review, Booking, Image } = require("../../db/models");
const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");

const validateSpot = [
  check("spotId").exists({ checkFalsy: true }).withMessage("Spot not found"),
];

const router = express.Router();

/////////////Images//////////////
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url } = req.body;
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  const newImage = Image.create({
    spotId,
    reviewId: null,
    url,
    imageType: "spot",
  });

  res.json("Image Added Succesfully!");
});
////////////Bookings////////////
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }

  const bookings = await Booking.findAll({
    where: { spotId },
  });
  res.json(bookings);
});

router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  const { startDate, endDate } = req.body;
  /*
  Spot Conficlt in timing.
  */
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }

  const booking = await Booking.create({
    spotId,
    userId: user.id,
    startDate,
    endDate,
  });

  res.json("Succesfully Created Bookin");
});

///////////////////////////////

///////reviews///////////
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;
  const reviews = Review.findAll({
    where: { id: spotId },
  });
  if (!reviews) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  return res.json(reviews);
});

router.post("/:spotId/reviews", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  //review exist already?
  //////////////////////////////////////////////////////////////////////
  const reviewExist = await Review.findOne({
    where: { userId: user.id, spotId },
  });
  if (reviewExist) {
    let error = new Error("User already has a review for this spot");
    error.status = 404;
    throw error;
  }

  const r = await Review.create({
    userId: user.id,
    spotId,
    review,
    stars,
  });
  res.json("Succesfully added new review!");
});

router.post("/:spotId/reviews/reviewId", requireAuth, async (req, res) => {
  const { spotId, reviewId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;
  //spot exists?
  const spotExist = await Review.findOne({ where: { id: reviewId } });
  if (!spotExist) {
    let error = new Error("Review couldn't be found");
    error.status = 404;
    throw error;
  }
  //Review already exists?

  // Post.findAll({ where: {deletedAt: null, topicId: req.params.id} })

  const r = await Review.update(
    {
      userId: user.id,
      spotId,
      review,
      stars,
    },
    { where: { id: reviewId } }
  );
  res.json(user.id);
});

router.delete("/:spotid/reviews/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const deletedReview = Review.destroy({
    where: { id: reviewId },
  });
  res.json("Review Deleted");
});
//////////reviews//////////

router.get("/me", requireAuth, async (req, res) => {
  const { user } = req;
  const spots = await Spot.findAll({
    where: { userId: user.id },
  });
  res.json(spots);
  // const spots = await Spot.findAll();
  // res.json(spots);
});

router.get("/:spotId", validateSpot, async (req, res) => {
  const id = req.params["spotId"];
  const spot = await Spot.findOne({
    where: { id },
  });
  if (!spot) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  res.json(spots);
});

router.get("/", async (req, res) => {
  const spots = await Spot.findAll({ include: Image });
  res.json("Previewimage:", spots.id);
});

//CREATE A SPOT *AUTH*

router.post("/", requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const spot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.json(spot);
});

//EDIT A SPOT *AUTH*

router.put("/:spotId", requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const { spotId } = req.params;
  const spot = await Spot.update(
    {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    },
    { where: { id: spotId } }
  );

  if (!spot[0]) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  return res.send("Succesfully Updated");
});

//DELETE A SPOT *AUTH*

router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  if (!spot[0]) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  const spot = await Spot.destroy({ where: { id: spotId } });

  res.json("Successfully deleted");
});

module.exports = router;
