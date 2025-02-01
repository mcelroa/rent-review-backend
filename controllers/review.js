const Review = require('../models/review');
const Property = require("../models/property");

exports.reviewById = async (req, res, next, id) => {
  try {
    const review = await Review.findById(id);

    req.review = review;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Review not found'
    })
  }
};

exports.createReview = async (req, res) => {
  const { propertyId, rating, comment } = req.body;
  const user = req.profile._id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: "Property not found" });

    const review = new Review({ property: propertyId, user, rating, comment });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: "Failed to add review" });
  }
};

exports.getReviewsByPropertyId = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.property._id }).populate("user", "name");
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reviews" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = req.review;

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user.toString() !== req.profile._id.toString()) {
      return res.status(403).json({ error: "User not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.review._id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.log(err); // Debug unexpected errors
    res.status(400).json({ error: "Failed to delete review" });
  }
};
