import winston from "winston";
import path from "path";
import fs from "fs";

// ✅ Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ✅ Define Winston Logger
const logger = winston.createLogger({
  level: "info", // Default logging level
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // ✅ Console logs (for development)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // ✅ File logs (for production/debugging)
    new winston.transports.File({ filename: path.join(logDir, "app.log") }),
  ],
});

// ✅ If in development, add verbose logging
if (process.env.NODE_ENV === "development") {
  logger.add(new winston.transports.File({ filename: path.join(logDir, "debug.log"), level: "debug" }));
}

export default logger;
