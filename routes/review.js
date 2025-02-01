const express = require("express");
const router = express.Router();

const { requireSignin, isAuth } = require("../controllers/auth");
const { userById } = require('../controllers/user');
const { propertyById } = require('../controllers/property');

const {
  reviewById,
  createReview,
  getReviewsByPropertyId,
  deleteReview,
} = require("../controllers/review");

router.post("/review/:userId", requireSignin, isAuth, createReview); // Add a new review
router.get("/reviews/:propertyId", getReviewsByPropertyId); // Get reviews for a property
router.delete("/review/:reviewId/:userId", requireSignin, isAuth, deleteReview); // Delete a review

router.param('reviewId', reviewById);
router.param('userId', userById);
router.param('propertyId', propertyById);

module.exports = router;
