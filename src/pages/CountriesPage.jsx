import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import countries from "../data/countries.json";
import schoolsPerCountryData from "../data/schools-per-country.json";
import "./CountriesPage.css";

export default function CountriesPage() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("");

  // Use precomputed data for better performance
  const schoolsPerCountry = schoolsPerCountryData.byName;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const byLetter = {};
    filtered.forEach((c) => {
      const letter = c.name[0]?.toUpperCase() || "#";
      if (!byLetter[letter]) byLetter[letter] = [];
      byLetter[letter].push(c);
    });
    return Object.keys(byLetter)
      .sort()
      .map((letter) => ({ letter, items: byLetter[letter] }));
  }, [filtered]);

  return (
    <main className="countries-page">
      <Helmet>
        <title>Countries with Flight Schools | PilotCenter</title>
        <meta
          name="description"
          content="Browse flight schools by country. Find pilot training programs worldwide and discover aviation schools in different countries."
        />
        <meta
          name="keywords"
          content="flight schools by country, pilot training worldwide, aviation schools, international flight schools, pilot training programs"
        />
      </Helmet>
      <section className="countries-hero">
        <div className="countries-hero-inner">
            <h1 className="countries-title">Countries</h1>
            <p className="countries-subtitle">
              Browse pilot guides by country and find flight schools worldwide.
            </p>

          <div className="countries-search-wrap">
            <div className="countries-search">
              <svg
                className="countries-search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M10 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12m0-2a8 8 0 1 0 4.9 14.3l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 0 0 10 2"
                />
              </svg>

              <input
                className="countries-search-input"
                placeholder="Search a country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search?.length > 0 && (
                <button
                  type="button"
                  className="countries-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="countries-search-meta">
              Showing <strong>{filtered.length}</strong> countries
            </div>
          </div>
        </div>
      </section>

      <section className="countries-list">
        <div className="countries-letter-index">
          {grouped.map(({ letter }) => (
            <a
              key={letter}
              href={`#${letter}`}
              className={activeLetter === letter ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveLetter(letter);
                document.getElementById(letter)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {letter}
            </a>
          ))}
        </div>

        <div className="countries-groups-container">
          {grouped.map(({ letter, items }) => (
            <div key={letter} className="countries-group" id={letter}>
              <h2 className="countries-group-letter">{letter}</h2>

            <div className="countries-group-items">
              {items.map((c) => {
                const count = schoolsPerCountry[c.name] || 0;
                return (
                  <div key={c.slug} className="country-row" data-country-slug={c.slug}>
                    <div className="country-row-main">
                      <span className="country-name">{c.name}</span>
                      {count > 0 && (
                        <span className="country-meta">
                          {count} flight school{count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <Link className="country-link" to={c["Import 725 (Item)"]}>
                      Go to &gt;
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      </section>
    </main>
  );
}