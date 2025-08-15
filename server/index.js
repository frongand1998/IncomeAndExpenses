require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration (dev + prod)
// In production, set FRONTEND_ORIGIN to your deployed frontend URL (e.g., https://your-app.vercel.app)
const allowedDevOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];
const prodOrigin = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];
const corsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== "production";
    const whitelist = isDev ? allowedDevOrigins : prodOrigin;
    // Allow server-to-server or tools without Origin header
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin} not in whitelist`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic request logger for debugging
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    try {
      console.log("Body:", JSON.stringify(req.body));
    } catch (_) {}
  }
  next();
});

// Import routes
const userRoutes = require("./routes/user");
const todoRoutes = require("./routes/todo");
const noteRoutes = require("./routes/note");
const incomeExpenseRoutes = require("./routes/incomeExpense");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/income-expenses", incomeExpenseRoutes);

// Simple route for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Health check JSON endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Global error handler (for catching unhandled errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/income_expenses",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
