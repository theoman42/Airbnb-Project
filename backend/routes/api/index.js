const router = require("express").Router();
const userRouter = require("./user.js");
//const usersRouter = require("./signup.js");
const spotRouter = require("./spots.js");

router.use("/users", userRouter);
//router.use("/users", usersRouter);
router.use("/spots", spotRouter);
router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;
