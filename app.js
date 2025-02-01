const express = require("express");
const mongoose = require('mongoose')
const morgan = require("morgan")
const cors = require('cors');
require("dotenv").config();

// Init app
const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/property");
const reviewRoutes = require("./routes/review");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"));

// middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api", authRoutes);
app.use("/api", propertyRoutes);
app.use("/api", reviewRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
