const express = require("express");
const router = express.Router();

const {
  verifyEmail
} = require("../controllers/mailer");

router.get("/verify-email/:userId", verifyEmail);

module.exports = router;
