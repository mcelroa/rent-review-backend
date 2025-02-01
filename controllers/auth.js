const User = require("../models/user");
const jwt = require("jsonwebtoken"); // generate signed token
const { expressjwt: Jwt } = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // App Password from Google
  },
});

exports.signup = async (req, res) => {
  const user = new User(req.body);

  const { email } = req.body;

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  user.verificationToken = verificationToken;

  try {
    const response = await user.save();

    response.salt = undefined;
    response.hashed_password = undefined;

    // Send verification email
    const verificationLink = `http://localhost:5000/api/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "Signup successful! Check your email to verify." });


    // res.json({ user: response });

  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error)
    })
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