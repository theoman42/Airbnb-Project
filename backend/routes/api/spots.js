const express = require("express");
const { validator } = require("validator");
const { Op } = require("sequelize");
const { check } = require("express-validator");
//const { ValidationError } = require("sequelize/types");
const { Spot, Review, Booking, Image, User } = require("../../db/models");
const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const user = require("../../db/models/user");
const searchValidation = [
  check("page")
    .isInt({ min: 0 })
    // .optional({ nullable: true })
    .withMessage("Page must be greater than or equal to 0"),
  check("size")
    .isInt({ min: 0 })
    // .optional({ nullable: true })
    .withMessage("Size must be greater than or equal to 0"),
  check("maxLat")
    // .isLatLong()
    .isDecimal()
    .withMessage("Maximum latitude is invalid"),
  check("minLat")
    // .isLatLong()
    .isDecimal()
    .withMessage("Minimum latitude is invalid"),
  check("maxLong")
    // .isLatLong()
    .isDecimal()
    .withMessage("Maximum longitude is invalid"),
  check("minLong")
    // .isLatLong()
    .isDecimal()
    .withMessage("Minimum longitude is invalid"),
  check("minPrice")
    .isDecimal({ min: 0 })
    // .optional({ nullable: true })
    .withMessage("Page must be greater than or equal to 0"),
  check("maxPrice")
    .isDecimal({ min: 0 })
    // .optional({ nullable: true })
    .withMessage("Size must be greater than or equal to 0"),
  handleValidationErrors,
];
const validateSpot = [
  check("spotId").exists({ checkFalsy: true }).withMessage("Spot not found"),
];
const validateConflict = [
  check("startDate")
    .isAfter({ checkFalsy: true })
    .withMessage("Start date conflicts with an existing booking"),
  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date conflicts with an existing booking"),
  handleValidationErrors,
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
  if (spotExist.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }

  const newImage = await Image.create({
    spotId,
    reviewId: null,
    url,
    imageType: "Spot",
  });

  res.json({
    id: newImage.id,
    imageableId: newImage.id,
    imageableType: "Spot",
    url: newImage.url,
  });
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
  if (!spotExist) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  if (spotExist.userId === user.id) {
    res.json("Cannot Book own Spot");
  }
  let { startDate, endDate } = req.body;
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  const conflict = await Booking.findAll({
    where: {
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          endDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      ],
    },
  });

  if (conflict.length) {
    res.status(403);
    let error = new Error(
      "Sorry, this spot is already booked for the specified dates"
    );
    error.message =
      "Sorry, this spot is already booked for the specified dates";
    error.errors = {
      startDate: "Start date conflicts with an existing booking",
      endDate: "End date conflicts with an existing booking",
    };
    error.status = 403;
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
  const spotCheck = await Spot.findOne({ where: { id: spotId } });
  if (!spotCheck) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
      },
      {
        model: Image,
        as: "images",
        attributes: [["url", "url"]],
      },
    ],
  });
  return res.json({ reviews });
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
      where: { spotId, userId: user.id },
    });
    if (reviewExist) {
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

router.put(
  "/:spotId/reviews/:reviewId",
  requireAuth,
  validateReviewBody,
  async (req, res) => {
    let { spotId, reviewId } = req.params;
    let { review, stars } = req.body;
    spotId = parseInt(spotId);
    reviewId = parseInt(reviewId);
    const { user } = req;
    //spot exists?
    const reviewExist = await Review.findOne({ where: { id: reviewId } });
    if (!reviewExist) {
      let error = new Error("Review couldn't be found");
      error.status = 404;
      throw error;
    }
    if (reviewExist.userId !== user.id) {
      let error = new Error("Authentication Required");
      error.status = 401;
      throw error;
    }

    const r = await reviewExist.update({
      review,
      stars,
    });
    res.json({
      id: r.spotId,
      userId: r.userId,
      spotId: r.spotId,
      review: r.review,
      stars: r.stars,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
);

router.delete("/:spotid/reviews/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  let { user } = req;
  const reviewExist = await Review.findOne({
    where: { id: reviewId },
  });
  if (!reviewExist) {
    let error = new Error("Review couldn't be found");
    error.status = 404;
    throw error;
  }
  if (reviewExist.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }

  await reviewExist.destroy();
  res.status(200);
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
      ["state", "state"],
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
      as: "images",
      attributes: [["url", "url"]],
    },
  });
  res.json({ spots });
});

router.get("/search", searchValidation, async (req, res, next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  if (!size) size = 20;
  if (!page) page = 0;

  page = parseInt(page);
  size = parseInt(size);

  page > 10 ? (page = 0) : (page = page);
  size > 20 ? (size = 20) : (size = size);

  let where = {};

  //LATTITUDE
  if (minLat) {
    where.lat = {
      [Op.gte]: minLat,
    };
  }

  if (maxLat) {
    where.lat = {
      [Op.lte]: maxLat,
    };
  }
  // LONGITUDE
  if (minLng) {
    where.lng = {
      [Op.gte]: minLng,
    };
  }

  if (maxLng) {
    where.lng = {
      [Op.lte]: maxLng,
    };
  }

  // PRICE
  if (minPrice) {
    where.price = {
      [Op.gte]: minPrice,
    };
  }

  if (maxPrice) {
    where.price = {
      [Op.lte]: maxPrice,
    };
  }

  const Spots = await Spot.findAll({
    where: { ...where },
    include: [
      {
        model: Image,
        as: "images",
        attributes: ["url"],
      },
    ],
  });

  res.status(200);
  return res.json({ Spots, page, size });
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
      ["state", "state"],
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
        as: "images",
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
      ["state", "state"],
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
      as: "images",
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
  let { spotId } = req.params;
  spotId = parseInt(spotId);
  const { user } = req;
  const spotCheck = await Spot.findOne({ where: { id: spotId } });
  if (!spotCheck) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  if (spotCheck.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
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
    id: spotId,
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
  let { spotId } = req.params;
  let { user } = req;
  spotId = parseInt(spotId);
  const spotCheck = await Spot.findOne({ where: { id: spotId } });
  if (!spotCheck) {
    let error = new Error("Spot couldn't be found");
    error.status = 404;
    throw error;
  }
  if (spotCheck.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }
  const spot = await Spot.destroy({ where: { id: spotId } });
  res.status(200);
  res.json({ message: "Succesfully Deleted", statusCode: 200 });
});

module.exports = router;
