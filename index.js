import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js"
import tourRoutes from "./Routes/TourRoutes.js"
import bookingRoutes from"./Routes/bookingRoutes.js"
import reviewRoutes from "./Routes/reviewsRoute.js"
import connectDB from "./Config/dbConnection.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables first
dotenv.config();

// Then log them
console.log("Database URL:", process.env.DATA_BASE);

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to database
connectDB();

// Body parser to read data from req.body
app.use(cors());
app.use(express.json());
app.use("/", express.static(join(__dirname, "")));

app.get("/", (req, res, next) => {
  res.send("Api is Running...!");
});

// API Middleware
app.use("/api/auth", authRoutes);
app.use("/api/tours",tourRoutes)
app.use("/api/bookings",bookingRoutes)
app.use("/api/reviews",reviewRoutes)
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
