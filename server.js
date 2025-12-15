const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config(); // Read environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Load all countries from local JSON
const countries = require("./data/countries.json");

// ======= MIDDLEWARES =======

// Enable CORS
app.use(cors());
app.use(express.json());

// Rate limiting: max 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests, please try again later" },
});
app.use(limiter);

// API Key authentication
// Set API key(s) in Render as environment variable: API_KEYS
// Example: key1,key2,key3
const validKeys = process.env.API_KEYS ? process.env.API_KEYS.split(",") : [];

app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || !validKeys.includes(key)) {
    return res.status(401).json({ error: "Unauthorized. Invalid API key." });
  }
  next();
});

// ======= COUNTRY ENDPOINT =======
app.get("/country", (req, res) => {
  const value = req.query.value?.trim().toLowerCase();

  if (!value) {
    return res.status(400).json({
      error: "Please provide a country name or country code",
    });
  }

  const country = countries.find(
    (c) =>
      c.cca2?.toLowerCase() === value || c.name.common.toLowerCase() === value
  );

  if (!country) {
    return res.status(404).json({
      error: "Country not found, please provide a valid country name or code",
    });
  }

  res.json({
    code: country.cca2,
    name: country.name.common,
    capital: country.capital?.[0] || "",
    currency: country.currencies ? Object.keys(country.currencies)[0] : "",
    phoneCode: country.idd?.root
      ? country.idd.root + (country.idd.suffixes?.[0] || "")
      : "",
    continent: country.region,
    timeZones: country.timezones,
  });
});

// ======= START SERVER =======
app.listen(PORT, () => {
  console.log(`✅ Country API running at http://localhost:${PORT}`);
});
