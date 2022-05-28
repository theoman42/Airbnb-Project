const express = require("express");

const { check } = require("express-validator");
//const { ValidationError } = require("sequelize/types");
const { Spot, Review, Booking, Image, User } = require("../../db/models");
const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");

const validateSpot = [
  check("spotId").exists({ checkFalsy: true }).withMessage("Spot not found"),
];

const validateReviewBody = [
  check("review")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];
const validateSpotBody = [
  check("address")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .exists({ checkFalsy: true })
    .withMessage("Latitude is not valid"),
  check("lng")
    .exists({ checkFalsy: true })
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors,
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
  const { user } = req;
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  let bookings;

  if (spotExist.userId === user.id) {
    bookings = await Booking.findAll({
      where: { spotId },
      attributes: [
        ["id", "id"],
        ["spotId", "spotId"],
        ["userId", "userId"],
        ["startDate", "startDate"],
        ["endDate", "endDate"],
        ["createdAt", "createdAt"],
        ["updatedAt", "updatedAt"],
      ],
      include: {
        model: User,
        attributes: [
          ["id", "id"],
          ["firstName", "firstName"],
          ["lastName", "lastName"],
        ],
      },
    });
  } else {
    bookings = await Booking.findAll({
      where: { spotId },
      attributes: [
        ["spotId", "spotId"],
        ["startDate", "startDate"],
        ["endDate", "endDate"],
      ],
    });
  }

  res.json({
    bookings,
  });
});

router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  let { spotId } = req.params;
  const { user } = req;
  spotId = parseInt(spotId);
  const spotExist = await Spot.findOne({ where: { id: spotId } });
  const { startDate, endDate } = req.body;
  /*
  Spot conflict in timing.
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

  res.json(booking);
});

///////////////////////////////

///////reviews///////////
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;
  const reviews = await Review.findAll({
    where: { spotId },
  });
  if (!reviews) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  return res.json(reviews);
});

router.post(
  "/:spotId/reviews",
  requireAuth,
  validateReviewBody,
  async (req, res) => {
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
      where: { spotId },
    });
    if (reviewExist.userId === user.id) {
      let error = new Error("User already has a review for this spot");
      error.status = 403;
      throw error;
    }

    const r = await Review.create({
      userId: user.id,
      spotId,
      review,
      stars,
    });
    res.json({
      id: r.id,
      userId: r.userId,
      spotId: r.spotId,
      review: r.review,
      stars: r.stars,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
);

router.put("/:spotId/reviews/:reviewId", requireAuth, async (req, res) => {
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
  res.json({
    id: r.id,
  });
});

router.delete("/:spotid/reviews/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const reviewExist = await Review.findOne({
    where: { id: reviewId },
  });
  if (!reviewExist) {
    let error = new Error("Review couldn't be found");
    error.status = 404;
    throw error;
  }
  const deletedReview = Review.destroy({
    where: { id: reviewId },
  });
  res.json({ message: "Succesfully Deleted", statusCode: 200 });
});
//////////reviews//////////

router.get("/me", requireAuth, async (req, res) => {
  const { user } = req;
  const spots = await Spot.findAll({
    where: { userId: user.id },
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
      ["createdAt", "createdAt"],
      ["updatedAt", "updatedAt"],
    ],
    include: {
      model: Image,
      attributes: [["url", "url"]],
    },
  });
  res.json(spots);
  // const spots = await Spot.findAll();
  // res.json(spots);
});

router.get("/:spotId", validateSpot, async (req, res) => {
  const id = req.params["spotId"];

  const spots = await Spot.findOne({
    where: { id },
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
      ["createdAt", "createdAt"],
      ["updatedAt", "updatedAt"],
    ],
    include: [
      {
        model: Image,
        attributes: [["url", "url"]],
      },
      {
        model: User,
        as: "Owner",
        attributes: [
          ["id", "id"],
          ["firstName", "firstName"],
          ["lastName", "lastName"],
        ],
      },
    ],
  });
  if (!spots) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  res.json(spots);
});

router.get("/", async (req, res) => {
  const spots = await Spot.findAll({
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
      ["createdAt", "createdAt"],
      ["updatedAt", "updatedAt"],
    ],
    include: {
      model: Image,
      attributes: [["url", "url"]],
    },
  });
  res.json({
    spots,
  });
});

//CREATE A SPOT *AUTH*

router.post("/", requireAuth, validateSpotBody, async (req, res) => {
  const { user } = req;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const spot = await Spot.create({
    userId: user.id,
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

  return res.json({
    id: spot.id,
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
  });
});

//EDIT A SPOT     *AUTH*

router.put("/:spotId", requireAuth, validateSpotBody, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const { spotId } = req.params;
  const { user } = req;
  const spotCheck = await Spot.findOne({ where: { id: spotId } });
  if (!spotCheck) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }

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

  return res.json({
    id: spot.id,
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
  });
});

//DELETE A SPOT *AUTH*

router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spotCheck = await Spot.findOne({ where: { id: spotId } });
  if (!spotCheck) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  const spot = await Spot.destroy({ where: { id: spotId } });

  res.json({ message: "Succesfully Deleted", statusCode: 200 });
});

module.exports = router;
