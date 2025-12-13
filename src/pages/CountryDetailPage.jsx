import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import countries from "../data/countries.json";
import "./CountryDetailPage.css";

function splitLines(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderParagraphs(text) {
  const parts = splitLines(text);
  return parts.map((p, i) => (
    <p key={i} className="country-paragraph">{p}</p>
  ));
}

function renderBullets(text) {
  const items = splitLines(text).map((s) => s.replace(/^-+\s*/, ""));
  return (
    <ul className="country-list">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default function CountryDetailPage() {
  const { countrySlug } = useParams();

  const country = useMemo(() => {
    return countries.find((c) => c.slug === countrySlug);
  }, [countrySlug]);

  if (!country) {
    return (
      <main className="country-page">
        <div className="country-container">
          <h1>Country not found</h1>
          <p>We couldn’t find this country page.</p>
          <Link to="/countries">← Back to Countries</Link>
        </div>
      </main>
    );
  }

  // ✅ These fields MUST exist in your CSV (or you can rename here)
  // If your column names differ, just change these variable assignments.
  const title =
    country.Title ||
    country.title ||
    `How to Become a Pilot in ${country.name} in 2025`;

  const subtitle =
    country.Subtitle ||
    country.subtitle ||
    `${country.name} in 2025`;

  const intro =
    country.Introduction ||
    country.Intro ||
    country.introduction ||
    "";

  // Steps: either separate fields, or one big block
  const step1 = country.Step1 || country["Step 1"] || "";
  const step2 = country.Step2 || country["Step 2"] || "";
  const step3 = country.Step3 || country["Step 3"] || "";
  const step4 = country.Step4 || country["Step 4"] || "";
  const step5 = country.Step5 || country["Step 5"] || "";
  const step6 = country.Step6 || country["Step 6"] || "";

  const cost =
    country.Cost ||
    country["Cost of Becoming a Pilot"] ||
    "";

  const studyAbroad =
    country["Study Abroad Options"] ||
    country.StudyAbroad ||
    "";

  const conclusion =
    country.Conclusion ||
    country.conclusion ||
    "";

  return (
    <main className="country-page">
      <div className="country-container">
        <div className="country-breadcrumb">
          <Link to="/countries">Countries</Link>
          <span className="country-breadcrumb-sep">/</span>
          <span>{country.name}</span>
        </div>

        <header className="country-hero">
          <h1 className="country-title">{title}</h1>
          <p className="country-subtitle">{subtitle}</p>
        </header>

        {/* Introduction */}
        {intro && (
          <section className="country-section">
            <h2>Introduction</h2>
            {renderParagraphs(intro)}
          </section>
        )}

        {/* Steps */}
        <section className="country-section">
          <h2>Step-by-step Guide</h2>

          {step1 && (
            <div className="country-step">
              <h3>Step 1: Meet the Basic Requirements</h3>
              {/* If your CSV stores bullets for step 1, keep them as lines */}
              {renderBullets(step1)}
            </div>
          )}

          {step2 && (
            <div className="country-step">
              <h3>Step 2: Access the Most Comprehensive Flight School Database</h3>
              {renderParagraphs(step2)}
            </div>
          )}

          {step3 && (
            <div className="country-step">
              <h3>Step 3: Obtain Your Student Pilot License (SPL)</h3>
              {renderBullets(step3)}
            </div>
          )}

          {step4 && (
            <div className="country-step">
              <h3>Step 4: Accumulate Flight Hours</h3>
              {renderParagraphs(step4)}
            </div>
          )}

          {step5 && (
            <div className="country-step">
              <h3>Step 5: Pass the Theoretical and Practical Exams</h3>
              {renderBullets(step5)}
            </div>
          )}

          {step6 && (
            <div className="country-step">
              <h3>Step 6: Additional Licensing and Specializations</h3>
              {renderParagraphs(step6)}
            </div>
          )}
        </section>

        {/* Cost */}
        {cost && (
          <section className="country-section">
            <h2>Cost of Becoming a Pilot in {country.name}</h2>
            {renderParagraphs(cost)}
          </section>
        )}

        {/* Study abroad */}
        {studyAbroad && (
          <section className="country-section">
            <h2>Study Abroad Options</h2>
            {renderParagraphs(studyAbroad)}
          </section>
        )}

        {/* Conclusion */}
        {conclusion && (
          <section className="country-section">
            <h2>Conclusion</h2>
            {renderParagraphs(conclusion)}
          </section>
        )}
      </div>
    </main>
  );
}