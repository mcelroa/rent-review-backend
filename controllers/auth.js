const User = require("../models/user");
const jwt = require("jsonwebtoken"); // generate signed token
const { expressjwt: Jwt } = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { sendVerificationEmail } = require("./mailer");

exports.signup = async (req, res) => {
  const user = new User(req.body);

  try {
    // Save the user to the database
    const response = await user.save();

    // Exclude sensitive data (e.g., salt, hashed_password)
    response.salt = undefined;
    response.hashed_password = undefined;

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URI}/verify-email/${response._id}`;  // Update with your real verification URL
    const subject = 'Please verify your email address';
    const textContent = `Click the link to verify your email: ${verificationLink}`;

    try {
      // Call the function to send the email
      await sendVerificationEmail(response.email, subject, textContent);
      res.json({ message: 'User created, verification email sent' });
    } catch (emailError) {
      return res.status(500).json({
        error: 'User created, but failed to send verification email',
        details: emailError.message
      });
    }

  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error)
    });
  }
};


exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user based on email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup",
      });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        error: "Your email is not verified. Please verify it before logging in.",
      });
    }

    // Authenticate user
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Password is incorrect",
      });
    }

    // Generate a signed token with user ID and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });

    // Return response with user and token to frontend client
    const { _id, name, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
};


exports.signout = (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("t");
    res.json({ message: "Signout success" });
  } catch (err) {
    res.status(500).json({ error: "Signout failed. Please try again." });
  }
};


exports.requireSignin = Jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied"
    });
  }
  next();
};