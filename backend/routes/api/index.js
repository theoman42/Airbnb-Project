const router = require("express").Router();
const userRouter = require("./user.js");
//const usersRouter = require("./signup.js");
const spotRouter = require("./spots.js");
const reviewRouter = require("./reviews");
const bookingRouter = require("./booking.js");
const imageRouter = require("./image");

router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/spots", spotRouter);
router.use("/bookings", bookingRouter);
router.use("/images", imageRouter);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;
