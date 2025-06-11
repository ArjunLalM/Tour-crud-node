// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import authRoutes from "./Routes/authRoutes.js"
// import tourRoutes from "./Routes/TourRoutes.js"
// import bookingRoutes from"./Routes/bookingRoutes.js"
// import reviewRoutes from "./Routes/reviewsRoute.js"
// import connectDB from "./Config/dbConnection.js";
// import http from "http"; // Needed for socket server
// import { Server } from "socket.io"; // Socket.IO server
// import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
// import { dirname, join } from "path";
// import { fileURLToPath } from "url";
// import setupSocketIO from "./middlewares/socket/socket.js";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Load env variables first
// dotenv.config();

// // Then log them
// console.log("Database URL:", process.env.DATA_BASE);

// const app = express();
// const PORT = process.env.PORT || 8000;
// // Initialize Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });
// // Connect to database
// connectDB();
// // Attach io to app if needed
// app.set("io", io);
// // Body parser to read data from req.body
// app.use(cors());
// app.use(express.json());
// app.use("/", express.static(join(__dirname, "")));

// app.get("/", (req, res, next) => {
//   res.send("Api is Running...!");
// });

// // API Middleware
// app.use("/api/auth", authRoutes);
// app.use("/api/tours",tourRoutes)
// app.use("/api/bookings",bookingRoutes)
// app.use("/api/reviews",reviewRoutes)
// app.use(notFound);
// app.use(errorHandler);
// // Setup Socket.IO logic
// setupSocketIO(io); // 
// const server = app.listen(PORT, () => {
//   console.log(` Server running on http://localhost:${PORT}`);
// });

// server.on("error", (error) => {
//   console.error("Server error:", error);
//   process.exit(1);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js";
import tourRoutes from "./Routes/TourRoutes.js";
import bookingRoutes from "./Routes/bookingRoutes.js";
import reviewRoutes from "./Routes/reviewsRoute.js";
import connectDB from "./Config/dbConnection.js";
import http from "http"; // For server
import { Server } from "socket.io"; // For Socket.IO
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import setupSocketIO from "./middlewares/socket/socket.js";

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();
console.log("Database URL:", process.env.DATA_BASE);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Attach io to app if needed in routes/controllers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/", express.static(join(__dirname, "")));

// Routes
app.get("/", (req, res) => {
  res.send("API is Running...!");
});
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO logic
setupSocketIO(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
