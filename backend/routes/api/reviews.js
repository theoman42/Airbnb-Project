const express = require("express");

const { Review, Spot, Image, User } = require("../../db/models");
const images = require("../../db/models/images");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  let { user } = req;
  const reviewExist = await Review.findOne({ where: { id: reviewId } });
  const imageCount = await Image.findAll({ where: { reviewId } });
  if (imageCount.length > 10) {
    let error = new Error(
      "Maximum number of images for this resource was reached"
    );
    error.status = 404;
    throw error;
  }
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
  const newImage = await Image.create({
    spotId: null,
    reviewId,
    url,
    imageType: "Review",
  });

  res.json({
    id: newImage.id,
    imageableId: newImage.id,
    imageableType: "Review",
    url: newImage.url,
  });
});

router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  const reviews = await Review.findAll({
    where: { userId: user.id },
    include: [
      {
        model: User,
        attributes: [
          ["id", "id"],
          ["firstName", "firstName"],
          ["lastName", "lastName"],
        ],
      },
      {
        model: Spot,
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
          ["price", "price"],
        ],
      },
      {
        model: Image,
        as: "images",
        attributes: [["url", "url"]],
      },
    ],
  });
  res.json(reviews);
});

module.exports = router;
