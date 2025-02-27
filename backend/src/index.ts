import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth";
import youtubeRoutes from "./youtube";
import logger from "./winston";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Log every API request
app.use((req, res, next) => {
  logger.info(`📥 ${req.method} ${req.url}`, { query: req.query, body: req.body });
  next();
});

app.use("/auth", authRoutes);
app.use("/youtube", youtubeRoutes);

// ✅ Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled Server Error:", { message: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running at ${process.env.PROD ? process.env.PROD_BACK_END + `/:${PORT}` : process.env.LOCAL_BACK_END}`);
});
