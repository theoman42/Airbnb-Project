// backend/utils/validation.js
const { validationResult } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);
  //console.log(validationErrors);
  let errorObj = {};
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors
      .array()
      // .map((error) => `${error.msg}`);
      .forEach((error) => {
        errorObj[error.param] = error.msg;
      });

    const err = Error("Validation error");
    err.errors = errorObj;
    err.status = 400;
    err.title = "Validation error";
    next(err);
  }
  next();
};

module.exports = {
  handleValidationErrors,
};
