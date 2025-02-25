import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth";
import youtubeRoutes from "./youtube";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/youtube", youtubeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
