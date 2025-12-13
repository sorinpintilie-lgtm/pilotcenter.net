import React from "react";
import { Link } from "react-router-dom";
import "./FlightSchoolCard.css";

function Stars({ rating }) {
  const value = rating || 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={
          "fs-stars-star" + (i <= Math.round(value) ? " fs-stars-star--full" : "")
        }
      >
        ★
      </span>
    );
  }
  return <div className="fs-stars">{stars}</div>;
}

export default function FlightSchoolCard({ school }) {
  const {
    slug,
    name,
    city,
    country,
    logoUrl,
    rating,
  } = school;

  const location = [city, country].filter(Boolean).join(", ");

  return (
    <article className="fs-card">
      <div className="fs-card-top">
        <div className="fs-card-logo-wrap">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="fs-card-logo"
              loading="lazy"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="fs-card-logo fs-card-logo--placeholder">
              {name?.[0] || "?"}
            </div>
          )}
        </div>
        <div className="fs-card-info">
          <h3 className="fs-card-name">{name}</h3>
          {location && <p className="fs-card-location">{location}</p>}
          <Stars rating={rating} />
        </div>
      </div>

      <div className="fs-card-actions">
        <Link to={`/schools/${slug}`} className="fs-card-btn">
          Go to 
        </Link>
      </div>
    </article>
  );
}