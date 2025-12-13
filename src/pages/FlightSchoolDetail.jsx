import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./FlightSchoolDetail.css";

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={"fs-tab-btn" + (active ? " fs-tab-btn--active" : "")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function FlightSchoolDetail() {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [status, setStatus] = useState("loading");
  const [tab, setTab] = useState("about");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setStatus("loading");
        const res = await fetch(`/schools/${slug}.json`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) {
          setSchool(data);
          setStatus("ready");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <main className="fs-detail-page">
        <p>Loading…</p>
      </main>
    );
  }

  if (status === "error" || !school) {
    return (
      <main className="fs-detail-page">
        <p>School not found.</p>
        <Link to="/schools" className="fs-back-link">
          ← Back to Flight Schools
        </Link>
      </main>
    );
  }

  const {
    name,
    logoUrl,
    about,
    services,
    website,
    email,
    phone,
    address,
    city,
    country,
    baseAirport,
  } = school;

  const fullAddress =
    address || [baseAirport, city, country].filter(Boolean).join(", ");

  const mapQuery = encodeURIComponent(
    fullAddress || `${name} ${city || ""} ${country || ""}`
  );
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <main className="fs-detail-page">
      <section className="fs-detail-header">
        <div>
          <Link to="/schools" className="fs-back-link">
            ← Flight Schools
          </Link>
          <h1 className="fs-detail-title">{name}</h1>

          <div className="fs-detail-tabs">
            <TabButton active={tab === "about"} onClick={() => setTab("about")}>
              About Us
            </TabButton>
            <TabButton
              active={tab === "services"}
              onClick={() => setTab("services")}
            >
              Services
            </TabButton>
            <TabButton
              active={tab === "contact"}
              onClick={() => setTab("contact")}
            >
              Contact
            </TabButton>
          </div>
        </div>

        {logoUrl && (
          <div className="fs-detail-logo-wrap">
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="fs-detail-logo"
            />
          </div>
        )}
      </section>

      <section className="fs-detail-body">
        {tab === "about" && (
          <div className="fs-detail-section">
            <h2>About Us</h2>
            {about ? (
              <p className="fs-detail-text">{about}</p>
            ) : (
              <p className="fs-detail-text">No description available.</p>
            )}
          </div>
        )}

        {tab === "services" && (
          <div className="fs-detail-section">
            <h2>Services</h2>
            {(() => {
              let items = [];

              // Case 1: it's already an array (just in case some are)
              if (Array.isArray(services)) {
                items = services;
              }
              // Case 2: it's a string like ["Examiner\nGround School\n..."]
              else if (typeof services === "string" && services.trim()) {
                let raw = services.trim();

                // If it looks like a JSON array: ["..."]
                if (raw.startsWith("[") && raw.endsWith("]")) {
                  try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                      // Sometimes it's ["line1\nline2\n..."], so join & split
                      raw = parsed.join("\n");
                    }
                  } catch {
                    // If JSON.parse fails, we just treat it as a plain string
                  }
                }

                items = raw
                  .split(/\r?\n|,/)
                  .map((item) => item.replace(/^"|"$/g, "").trim()) // remove extra quotes
                  .filter(Boolean);
              }

              return items.length ? (
                <ul className="fs-services-list">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="fs-detail-text">Services information not provided.</p>
              );
            })()}
          </div>
        )}

        {tab === "contact" && (
          <div className="fs-detail-section fs-detail-section--contact">
            <div className="fs-contact-block">
              {fullAddress && (
                <p className="fs-contact-line">
                  <strong>Address: </strong> {fullAddress}
                </p>
              )}
              {phone && (
                <p className="fs-contact-line">
                  <strong>Phone: </strong>{" "}
                  <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                </p>
              )}
              {email && (
                <p className="fs-contact-line">
                  <strong>Email: </strong>{" "}
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              )}
              {website && (
                <p className="fs-contact-line">
                  <strong>Website: </strong>{" "}
                  <a href={website} target="_blank" rel="noreferrer">
                    {website.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              )}
            </div>

            <div className="fs-detail-map-wrapper">
              <iframe
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${name} location`}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}