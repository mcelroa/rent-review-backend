const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info", // Log levels: error, warn, info, http, verbose, debug, silly
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: "logs/app.log" }) // Logs to a file
  ],
});

module.exports = logger;
