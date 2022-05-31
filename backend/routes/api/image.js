const express = require("express");

const { Image } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.delete("/:imageId", requireAuth, async (req, res) => {
  const { imageId } = req.params;
  let { user } = req;
  //const t = Image.f;
  const image = await Image.findOne({
    id: imageId,
  });
  if (!image) {
    let error = new Error("Image couldn't be found");
    error.status = 404;
    throw error;
  }
  if (image.userId !== user.id) {
    let error = new Error("Authentication Required");
    error.status = 401;
    throw error;
  }
  await image.destroy();

  res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

module.exports = router;
