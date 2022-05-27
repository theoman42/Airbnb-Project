const express = require("express");

const { Review, Spot, Image } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  const reviews = await Review.findAll({
    where: { userId: user.id },
  });
  res.json(reviews);
});

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
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
  const newImage = Image.create({
    spotId: null,
    reviewId,
    url,
    imageType: "review",
  });

  res.json(newImage);
});

module.exports = router;
