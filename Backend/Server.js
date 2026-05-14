import dotenv from "dotenv";


dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import PropertyRoutes from "./routes/PropertyRoutes.js";

const app = express();

// Middleware
app.use(express.json());

app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/property", PropertyRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Connect DB + Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((err) => console.log(err));