import winston from "winston";
import { format, transports } from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`;
});

const timezoned = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Canada/Eastern",
  });
};

// ✅ Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ✅ Define Winston Logger
const logger = winston.createLogger({
  level: "info", // Default logging level
  format: combine(winston.format.colorize(), timestamp({ format: timezoned }), myFormat),
  transports: [new transports.Console(), new transports.File({ filename: path.join(logDir, "combined.log") })],
});

// ✅ If in development, add verbose logging
if (process.env.NODE_ENV === "development") {
  logger.add(new winston.transports.File({ filename: path.join(logDir, "debug.log"), level: "debug" }));
}

export default logger;
