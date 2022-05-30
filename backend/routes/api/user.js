const express = require("express");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User } = require("../../db/models");

const router = express.Router();

const validateLogin = [
  check("email")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Email is required"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
  handleValidationErrors,
];

const validateSignup = [
  check("email").exists({ checkFalsy: true }).withMessage("Invalid email"),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  handleValidationErrors,
];

router.post("/signup", validateSignup, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await User.signup({
    firstName,
    lastName,
    email,
    password,
  });

  await setTokenCookie(res, user);

  return res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    token: "",
  });
});

router.get("/me", restoreUser, requireAuth, (req, res) => {
  const { user } = req;
  if (user) return res.json(user.toSafeObject());
  else return res.json();
});

router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.login({ email, password });
  if (!user) {
    const err = new Error("Invalid Credentials");
    err.status = 401;
    err.title = "Invalid Credentials";
    //err.errors = ["Invalid Credentials"];
    return next(err);
  }

  await setTokenCookie(res, user);

  return res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    token: "",
  });
});

router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

module.exports = router;
