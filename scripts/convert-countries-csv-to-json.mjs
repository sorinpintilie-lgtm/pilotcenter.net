import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const csvPath = path.join(root, "data", "Countries.csv");
const outPath = path.join(root, "src", "data", "countries.json");

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

if (!fs.existsSync(csvPath)) {
  console.error("❌ CSV not found:", csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, "utf8");

const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  bom: true,
  relax_quotes: true,
  relax_column_count: true,
  trim: true,
});

function pickCountryName(row) {
  // Adjust these if your header is different
  return (
    row.Country ||
    row.country ||
    row.Name ||
    row.name ||
    row.COUNTRY ||
    ""
  );
}

// Keep all CSV fields, but normalize name + slug
const normalized = rows
  .map((row) => {
    const name = String(pickCountryName(row)).trim();
    if (!name) return null;

    return {
      ...row,           // ✅ keep everything from CSV (your article fields)
      name,             // ✅ normalized country display name
      slug: slugify(name), // ✅ slug for routing
    };
  })
  .filter(Boolean);

// de-duplicate by slug
const unique = [];
const seen = new Set();
for (const c of normalized) {
  if (seen.has(c.slug)) continue;
  seen.add(c.slug);
  unique.push(c);
}

// sort A–Z by name
unique.sort((a, b) => String(a.name).localeCompare(String(b.name)));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(unique, null, 2), "utf8");

console.log(`✅ Wrote ${unique.length} countries to ${outPath}`);