import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import webhookRoutes from "./routes/webhooks.js";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://r.stripe.com/b",
      "https://supa-threads.vercel.app",
      "https://supa-threads-git-main-snapedevs-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies
  })
);

// Handle preflight requests manually (important!)
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

app.use("/api", authRoutes);
app.use("/api", paymentRoutes); // Payment routes
app.use("/api/stripe-webhook", webhookRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
