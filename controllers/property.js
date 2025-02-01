const Property = require("../models/property");

exports.propertyById = async (req, res, next, id) => {
  try {
    const property = await Property.findById(id);

    req.property = property;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Property not found'
    })
  }
};

exports.getAllProperties = async (req, res) => {
  try {

    const searchQuery = req.query.search || ""; // Get search parameter

    // Create a case-insensitive regex to match address or city
    const searchRegex = new RegExp(searchQuery, "i");

    const properties = await Property.find({
      $or: [{ address: searchRegex }, { city: searchRegex }]
    }).populate("addedBy", "name");

    res.json(properties);
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.property._id).populate("addedBy", "name");

    if (!property) return res.status(404).json({ error: "Property not found" });

    res.json(property);
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch property" });
  }
};

exports.createProperty = async (req, res) => {
  const { address, city } = req.body;
  const addedBy = req.profile._id; // From decoded JWT

  try {
    const property = new Property({ address, city, addedBy });
    console.log(property)
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: "Failed to add property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = req.property;

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Optional: Check if the logged-in user owns the property
    if (property.addedBy.toString() !== req.profile._id.toString()) {
      return res.status(403).json({ error: "User not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(req.property._id); // Use findByIdAndDelete
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.log(err); // Debug unexpected errors
    res.status(400).json({ error: "Failed to delete property" });
  }
};
