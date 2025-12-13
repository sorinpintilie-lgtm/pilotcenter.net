import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import countries from "../data/countries.json";
import schoolsData from "../data/flightschools.json";
import FlightSchoolCard from "../components/FlightSchoolCard";
import "./CountryDetailPage.css";

function splitBlocks(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.trimEnd());
}

function isHeading(line) {
  // headings in your content look like:
  // "Introduction", "Step 1: ...", "Cost of ...", "Study Abroad Options", "Conclusion"
  if (!line) return false;
  if (/^Step\s+\d+:/i.test(line)) return true;
  if (/^(Introduction|Conclusion|Study Abroad Options)$/i.test(line)) return true;
  if (/^Cost of /i.test(line)) return true;
  return false;
}

function normalizeCountryName(s) {
  return String(s || "").trim().toLowerCase();
}

function renderParagraphs(lines) {
  // group consecutive non-empty lines into paragraphs,
  // but keep bullet lists
  const out = [];
  let buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    out.push(buffer.join(" ").trim());
    buffer = [];
  };

  for (const line of lines) {
    if (!line) {
      flush();
      continue;
    }

    // bullet line
    if (/^-+\s+/.test(line)) {
      flush();
      out.push({ bullet: line.replace(/^-+\s+/, "") });
      continue;
    }

    buffer.push(line);
  }

  flush();
  return out;
}

export default function HowToBecomePilotCountryPage() {
  const { slug } = useParams();

  // match by URL path stored in CSV:
  // Import 725 (Item) = "/how-to-become-a-pilot-in/slovenia"
  const record = useMemo(() => {
    const path = `/how-to-become-a-pilot-in/${slug}`;
    return countries.find((c) => String(c["Import 725 (Item)"] || "").trim() === path);
  }, [slug]);

  // Pre-compute country name for flight schools filtering
  const countryNameNormalized = normalizeCountryName(record?.Country || "");

  const schoolsInCountry = useMemo(() => {
    return (schoolsData || [])
      .filter((s) => normalizeCountryName(s.country) === countryNameNormalized)
      .filter((s) => (s.name || "").trim().length > 0);
  }, [countryNameNormalized]);

  if (!record) {
    return (
      <main className="country-page">
        <div className="country-container">
          <h1>Page not found</h1>
          <p>We couldn’t find this country guide.</p>
          <Link to="/countries">← Back to Countries</Link>
        </div>
      </main>
    );
  }

  const title = record.Title || `How to Become a Pilot in ${record.Country} in 2025`;
  const countryName = record.Country || "";
  const content = record.Content || "";

  // Parse content into sections by headings
  const lines = splitBlocks(content);

  // First line is usually like "Slovenia in 2025"
  const subtitleLine = (lines.find((l) => l && !isHeading(l)) || "").trim();

  // Build sections: [{heading, bodyLines[]}]
  const sections = [];
  let current = { heading: "", body: [] };

  // Skip subtitle line if it exists
  let started = false;

  for (const line of lines) {
    if (!line) {
      if (started) current.body.push("");
      continue;
    }

    if (!started && subtitleLine && line.trim() === subtitleLine.trim()) {
      started = true;
      continue;
    }

    started = true;

    if (isHeading(line.trim())) {
      if (current.heading || current.body.length) sections.push(current);
      current = { heading: line.trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.heading || current.body.length) sections.push(current);

  return (
    <main className="country-page">
      <div className="country-container">
        <div className="country-breadcrumb">
          <Link to="/countries">Countries</Link>
          <span className="country-breadcrumb-sep">/</span>
          <span>{countryName}</span>
        </div>

        <header className="country-hero">
          <h1 className="country-title">{title}</h1>
          {subtitleLine && <p className="country-subtitle">{subtitleLine}</p>}
        </header>

        {sections.map((sec, idx) => {
          const items = renderParagraphs(sec.body);

          const bullets = items.filter((x) => typeof x === "object" && x.bullet);
          const paragraphs = items.filter((x) => typeof x === "string");

          return (
            <section className="country-section" key={`${sec.heading}-${idx}`}>
              <h2>{sec.heading}</h2>

              {paragraphs.map((p, i) => (
                <p className="country-paragraph" key={i}>
                  {p}
                </p>
              ))}

              {bullets.length > 0 && (
                <ul className="country-list">
                  {bullets.map((b, i) => (
                    <li key={i}>{b.bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {/* Flight Schools list */}
        <section className="country-section">
          <div className="country-schools-header">
            <h2>Flight Schools in {countryName}</h2>

            <Link
              className="country-schools-viewall"
              to={`/schools?country=${encodeURIComponent(countryName)}`}
            >
              View all on Flight Schools →
            </Link>
          </div>

          {schoolsInCountry.length === 0 ? (
            <p className="country-paragraph">
              No flight schools are currently listed for {countryName}.
            </p>
          ) : (
            <>
              <p className="country-paragraph">
                Showing {schoolsInCountry.length} schools in {countryName}.
              </p>

              <div className="country-schools-grid">
                {schoolsInCountry.map((s) => (
                  <FlightSchoolCard key={s.slug || s.id || s.name} school={s} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}