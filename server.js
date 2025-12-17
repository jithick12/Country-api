const express = require("express");
const cors = require("cors");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Load all countries from local JSON
const countries = require("./data/countries.json");

// ======= MIDDLEWARES =======

app.use(cors());
app.use(express.json());

// 🔑 Allow ONLY RapidAPI requests
app.use((req, res, next) => {
  const rapidApiKey = req.headers["x-rapidapi-key"];
  const rapidApiHost = req.headers["x-rapidapi-host"];

  if (!rapidApiKey || !rapidApiHost) {
    return res.status(401).json({
      error: "Unauthorized..",
    });
  }
  next();
});

// 🚦 Safety rate limiting (IPv4 + IPv6 SAFE)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // safety limit
  keyGenerator: (req) => req.headers["x-rapidapi-key"] || ipKeyGenerator(req),
  message: { error: "Too many requests, please try again later" },
});

app.use(limiter);

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
  console.log(`✅ Country API running on port ${PORT}`);
});
