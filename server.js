const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Load all countries from local JSON
const countries = require("./data/countries.json");

app.use(cors());
app.use(express.json());

// GET country by name or code
// Example: /country?value=IN OR /country?value=India
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
      error: "Country not found ,please provide an valid country name or code",
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Country API running at http://localhost:${PORT}`);
});
