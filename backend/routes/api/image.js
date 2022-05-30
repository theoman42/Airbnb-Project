const express = require("express");

const { Image } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

router.delete("/:imageId", requireAuth, async (req, res) => {
  const { imageId } = req.params;
  //const t = Image.f;
  const deletedImage = await Image.destroy({
    where: { id: imageId },
  });
  if (!deletedImage) {
    let error = new Error("Image couldn't be found");
    error.status = 404;
    throw error;
  }

  res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

module.exports = router;
