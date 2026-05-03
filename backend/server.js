const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const UserRoutes = require("./routes/userRoutes");
const BlogRoutes = require("./routes/blogRoutes");
const CloudinaryConfig = require("./config/cloudinaryConfig");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

function corsOriginResolver() {
  const raw = process.env.FRONTEND_URL || "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return function corsOrigin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowed.length === 0) {
      return callback(null, true);
    }
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    const isLocalDev =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    if (isLocalDev && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, false);
  };
}

app.use(
  cors({
    origin: corsOriginResolver(),
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/v1", UserRoutes);
app.use("/api/v1", BlogRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  dbConnect(process.env.DB_URL);
  CloudinaryConfig();
});
