import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const schoolsDataPath = path.join(root, "src", "data", "flightschools.json");
const countriesPath = path.join(root, "src", "data", "countries.json");

const schoolsData = JSON.parse(fs.readFileSync(schoolsDataPath, "utf8"));
const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));


const outPath = path.join(root, "src", "data", "schools-per-country.json");

// Compute schools per country
const schoolsPerCountry = {};
schoolsData.forEach((school) => {
  const countryName = (school.country || "").trim();
  if (!countryName) return;
  schoolsPerCountry[countryName] = (schoolsPerCountry[countryName] || 0) + 1;
});

// Add slug mapping for easier lookup
const result = {
  byName: schoolsPerCountry,
  bySlug: {}
};

countries.forEach((country) => {
  result.bySlug[country.slug] = schoolsPerCountry[country.name] || 0;
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

console.log(`✅ Precomputed schools per country data to ${outPath}`);
console.log(`   Found ${Object.keys(schoolsPerCountry).length} countries with flight schools`);