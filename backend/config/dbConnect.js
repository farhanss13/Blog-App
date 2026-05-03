const mongoose = require("mongoose");
const dns = require("dns");

function normalizeDbUrl(dbUrl) {
  if (!dbUrl || typeof dbUrl !== "string") return "";
  return dbUrl.trim().replace(/^["']|["']$/g, "");
}

async function dbConnect(dbUrl) {
  const url = normalizeDbUrl(dbUrl);

  if (!url) {
    console.error(
      "DB_URL is missing or invalid. Set it in backend/.env (MongoDB Atlas connection string)."
    );
    return;
  }

  // Fixes many Windows "querySrv ECONNREFUSED" errors with mongodb+srv (IPv6/DNS ordering).
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 20000,
      maxPoolSize: 10,
      family: 4,
    });
    console.log("DB connected successfully");
  } catch (error) {
    const msg = error.message || String(error);
    console.error("Database connection failed:", msg);

    if (/querySrv|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
      console.error(`
Atlas / DNS troubleshooting:
  1. Atlas → Network Access → allow your IP (use 0.0.0.0/0 only while testing).
  2. Confirm DB_URL user/password are correct (special chars URL-encoded in password).
  3. If mongodb+srv still fails on Windows: Atlas → Connect → "Drivers" → use the
     non-SRV connection string (mongodb://host1:27017,host2:27017,...) when offered,
     or try another network / disable VPN.
  4. Restart the backend after changing .env.
`);
    }

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

module.exports = dbConnect;
