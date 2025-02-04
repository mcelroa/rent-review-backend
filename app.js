const express = require("express");
const mongoose = require('mongoose')
const morgan = require("morgan")
const cors = require('cors');
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const logger = require("./utils/logger");

// Init app
const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/property");
const reviewRoutes = require("./routes/review");
const mailerRoutes = require("./routes/mailer");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"));

// Create a rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: { error: "You have exceeded the request limit. Try again later." },
  headers: true, // Include rate limit info in headers
});

// middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// Log every request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});


app.use("/api", authRoutes);
app.use("/api", propertyRoutes);
app.use("/api", reviewRoutes);
app.use("/api", mailerRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
