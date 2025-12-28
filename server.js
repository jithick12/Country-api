const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Load all countries
const countries = require("./data/countries.json");

// ======= MIDDLEWARE =======
app.use(cors());
app.use(express.json());

// 🔐 Allow ONLY RapidAPI traffic
app.use((req, res, next) => {
  const rapidApiKey = req.headers["x-rapidapi-key"];
  const rapidApiHost = req.headers["x-rapidapi-host"];

  if (!rapidApiKey || !rapidApiHost) {
    return res.status(401).json({
      error: "Unauthorized. This API is available only via RapidAPI.",
    });
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

// ======= 404 HANDLER =======
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ======= ERROR HANDLER =======
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ======= START SERVER =======
app.listen(PORT, () => {
  console.log(`✅ Country API running on port ${PORT}`);
});
