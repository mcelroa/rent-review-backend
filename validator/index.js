const { check, validationResult } = require("express-validator");

// Validation middleware
exports.userSignupValidator = [
  // Validate "name"
  check("name", "Name is required").notEmpty(),

  // Validate "email"
  check("email", "Email must be between 3 to 32 characters")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ min: 4, max: 32 }),

  // Validate "password"
  check("password", "Password is required").notEmpty(),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),

  // Handle validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  },
];
