import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FlightSchoolCard from "../components/FlightSchoolCard";
import data from "../data/flightschools.json";

const PAGE_SIZE = 24;

// replace this with your real MyMaps embed URL when you have it
const WORLD_MAP_EMBED_URL =
  "https://www.google.com/maps/d/embed?mid=YOUR_MYMAPS_ID_HERE&z=3&output=embed&noprof=1";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FlightSchoolsPage() {
  const query = useQuery();
  const countryFromUrl = query.get("country") || "";

  const [filters, setFilters] = useState({
    continent: "All",
    country: countryFromUrl !== "" ? countryFromUrl : "All",
    state: "All",
    fleetSize: "All",
    visaF1: false,
    visaM1: false,
    visaOther: false,
  });
  const [page, setPage] = useState(1);

  const schools = data;

  // build dropdown option lists
  const continents = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => s.continent && set.add(s.continent));
    return ["All", ...Array.from(set).sort()];
  }, [schools]);

  const countries = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => {
      if (!s.country) return;
      if (filters.continent !== "All" && s.continent !== filters.continent) return;
      set.add(s.country);
    });
    return ["All", ...Array.from(set).sort()];
  }, [schools, filters.continent]);

  const states = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => {
      if (!s.state) return;
      if (filters.country !== "All" && s.country !== filters.country) return;
      set.add(s.state);
    });
    return ["All", ...Array.from(set).sort()];
  }, [schools, filters.country]);

  const fleetSizes = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => s["fleetSize"] && set.add(s["fleetSize"]));
    return ["All", ...Array.from(set).sort()];
  }, [schools]);

  const handleSelectChange = (key) => (e) => {
    setFilters((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
    setPage(1);
  };

  const handleCheckboxChange = (key) => (e) => {
    setFilters((prev) => ({
      ...prev,
      [key]: e.target.checked,
    }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (filters.continent !== "All" && s.continent !== filters.continent)
        return false;
      if (filters.country !== "All" && s.country !== filters.country) return false;
      if (filters.state !== "All" && s.state !== filters.state) return false;

      if (filters.fleetSize !== "All" && s.fleetSize !== filters.fleetSize)
        return false;

      const visaField = (s.visaInsurance || s["Visa insurance"] || "")
        .toString()
        .toLowerCase();

      if (filters.visaF1 && !visaField.includes("f-1") && !visaField.includes("f1"))
        return false;
      if (filters.visaM1 && !visaField.includes("m-1") && !visaField.includes("m1"))
        return false;
      if (
        filters.visaOther &&
        !visaField.includes("other") &&
        !visaField.includes("o-")
      )
        return false;

      return true;
    });
  }, [schools, filters]);

  const visible = useMemo(
    () => filtered.slice(0, PAGE_SIZE * page),
    [filtered, page]
  );

  const canLoadMore = visible.length < filtered.length;

  return (
    <main className="fs-page">
      <section className="fs-hero">
        <h1 className="fs-hero-title">Flight Schools</h1>
      </section>

      {/* Filter panel */}
      <section className="fs-filters-bar">
        <div className="fs-filters-row">
          <div className="fs-filter-group">
            <p className="fs-filter-title">Filter by Continent</p>
            <select
              className="fs-select"
              value={filters.continent}
              onChange={handleSelectChange("continent")}
            >
              {continents.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="fs-filter-group">
            <p className="fs-filter-title">Filter by State</p>
            <select
              className="fs-select"
              value={filters.state}
              onChange={handleSelectChange("state")}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="fs-filter-group">
            <p className="fs-filter-title">Filter by Country</p>
            <select
              className="fs-select"
              value={filters.country}
              onChange={handleSelectChange("country")}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="fs-filter-group">
            <p className="fs-filter-title">Filter by Fleet size</p>
            <select
              className="fs-select"
              value={filters.fleetSize}
              onChange={handleSelectChange("fleetSize")}
            >
              {fleetSizes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="fs-filter-group fs-filter-group--visas">
            <p className="fs-filter-title">Visa Insurance</p>
            <label className="fs-checkbox-row">
              <input
                type="checkbox"
                checked={filters.visaF1}
                onChange={handleCheckboxChange("visaF1")}
              />
              <span>F-1 Visa</span>
            </label>
            <label className="fs-checkbox-row">
              <input
                type="checkbox"
                checked={filters.visaM1}
                onChange={handleCheckboxChange("visaM1")}
              />
              <span>M-1 Visa</span>
            </label>
            <label className="fs-checkbox-row">
              <input
                type="checkbox"
                checked={filters.visaOther}
                onChange={handleCheckboxChange("visaOther")}
              />
              <span>Other</span>
            </label>
          </div>
        </div>
      </section>

      {/* World map */}
      <section className="fs-map-section">
        <div className="fs-map-wrapper">
          <iframe
            src={WORLD_MAP_EMBED_URL}
            title="Flight schools map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Cards */}
      <section className="fs-results">
        <div className="fs-results-header">
          <span>
            Showing <strong>{filtered.length}</strong> schools
          </span>
        </div>

        <div className="fs-grid">
          {visible.map((school) => (
            <FlightSchoolCard key={school.id} school={school} />
          ))}
        </div>

        {canLoadMore && (
          <div className="fs-load-more-wrap">
            <button
              type="button"
              className="fs-load-more-btn"
              onClick={() => setPage((p) => p + 1)}
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}