import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.join(__dirname, "..");
const JSON_PATH = path.join(PROJECT_ROOT, "src", "data", "flightschools.json");
const LOGO_DIR = path.join(PROJECT_ROOT, "public", "flightschool-logos");

// Load flightschools.json
const schools = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

// List logo files
const logoFiles = glob.sync("*.*", {
  cwd: LOGO_DIR,
  nocase: true,
});

console.log(`Found ${logoFiles.length} logo files.`);

// Normalize for matching
const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

// Try to match a logo to a school
function findLogoForSchool(school) {
  const slug = normalize(school.slug || "");
  const name = normalize(school.name || "");

  // Try slug matches
  let match = logoFiles.find((file) => normalize(file).includes(slug));
  if (match) return match;

  // Try name matches
  match = logoFiles.find((file) => normalize(file).includes(name));
  if (match) return match;

  return null;
}

let matched = 0;
let unmatched = 0;

for (const school of schools) {
  const logo = findLogoForSchool(school);

  if (logo) {
    school.logoUrl = `/flightschool-logos/${logo}`;
    matched++;
  } else {
    school.logoUrl = "";
    unmatched++;
  }
}

fs.writeFileSync(JSON_PATH, JSON.stringify(schools, null, 2), "utf8");

console.log("====================================");
console.log(`Matched:   ${matched}`);
console.log(`Unmatched: ${unmatched}`);
console.log("Updated flightschools.json with logoUrl paths.");
console.log("====================================");