const express = require("express");
const router = express.Router();

const { requireSignin, isAuth } = require("../controllers/auth");
const { userById } = require('../controllers/user')

const {
  propertyById,
  getAllProperties,
  getPropertyById,
  createProperty,
  deleteProperty,
} = require("../controllers/property");

router.get("/properties", getAllProperties); // Fetch all properties
router.post("/property/:userId", requireSignin, isAuth, createProperty); // Add a new property
router.get("/property/:propertyId", getPropertyById); // Fetch a specific property
router.delete("/property/:propertyId/:userId", requireSignin, isAuth, deleteProperty); // Delete a property

router.param("propertyId", propertyById);
router.param("userId", userById);


module.exports = router;
