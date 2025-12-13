import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import "./FlightSchools.css";
import FlightSchoolCard from "../components/FlightSchoolCard";
import SchoolsMapEmbed from "../components/SchoolsMapEmbed";
import schoolsData from "../data/flightschools.json";

const PAGE_SIZE = 24;

export default function FlightSchools() {
  const [filters, setFilters] = useState({
    continent: "All",
    country: "All",
    state: "All",
  });

  // rawSearch = what user types, searchQuery = debounced value actually used
  const [rawSearch, setRawSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("name"); // "name" | "country" | "rating"
  const [page, setPage] = useState(1);

  const loadMoreRef = useRef(null);

  const isStateEnabled =
    filters.continent === "North America" ||
    filters.country === "United States" ||
    filters.country === "USA";

  useEffect(() => {
    if (!isStateEnabled && filters.state !== "All") {
      setFilters((prev) => ({ ...prev, state: "All" }));
    }
  }, [isStateEnabled, filters.state]);

  // Debounce search input (250ms)
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(rawSearch);
      setPage(1); // reset page whenever the debounced value changes
    }, 250);

    return () => clearTimeout(id);
  }, [rawSearch]);

  // All schools from JSON
  const schools = useMemo(() => {
    return schoolsData.filter((s) => {
      const name = (s.name || "").trim();
      return name.length > 0;
    });
  }, []);

  // Build filter options
  const continents = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => s.continent && set.add(s.continent));
    return ["All", ...Array.from(set).sort()];
  }, [schools]);

  const countries = useMemo(() => {
    const set = new Set();
    schools.forEach((s) => {
      if (!s.country) return;
      if (filters.continent !== "All" && s.continent !== filters.continent)
        return;
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

  const handleSelectChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setRawSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setRawSearch("");
    setSearchQuery("");
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Apply filters + search + sorting
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = schools.filter((s) => {
      if (filters.continent !== "All" && s.continent !== filters.continent)
        return false;
      if (filters.country !== "All" && s.country !== filters.country) return false;
      if (filters.state !== "All" && s.state !== filters.state) return false;

      if (!q) return true;

      const haystack = [
        s.name,
        s.city,
        s.country,
        s.state,
        s.typeOfSchool,
        s.baseAirport,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    // Sorting
    list = list.slice(); // copy just to be safe
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "country") {
      list.sort((a, b) => (a.country || "").localeCompare(b.country || ""));
    } else if (sortBy === "rating") {
      list.sort(
        (a, b) =>
          (b.rating || 0) - (a.rating || 0) ||
          (a.name || "").localeCompare(b.name || "")
      );
    }

    return list;
  }, [schools, filters, searchQuery, sortBy]);

  // Pagination / visible slice
  const visible = useMemo(
    () => filtered.slice(0, PAGE_SIZE * page),
    [filtered, page]
  );
  const canLoadMore = visible.length < filtered.length;

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!canLoadMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [canLoadMore]);

  return (
    <main className="fs-page">
      <section className="fs-hero">
        <h1 className="fs-hero-title">Flight Schools</h1>
      </section>

      {/* Filters */}
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
            <p className="fs-filter-title">Filter by State</p>
            <select
              className={`fs-select ${!isStateEnabled ? "fs-select--disabled" : ""}`}
              value={filters.state}
              onChange={handleSelectChange("state")}
              disabled={!isStateEnabled}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Search + sort row */}
      <section className="fs-search-bar">
        <div className="fs-search-wrapper">
          <input
            type="text"
            className="fs-search-input"
            placeholder="Search by school name, city, country..."
            value={rawSearch}
            onChange={handleSearchChange}
          />
          {rawSearch && (
            <button
              type="button"
              className="fs-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="fs-sort-wrapper">
          <label className="fs-sort-label" htmlFor="fs-sort-select">
            Sort by
          </label>
          <select
            id="fs-sort-select"
            className="fs-select fs-sort-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="name">Name (A–Z)</option>
            <option value="country">Country (A–Z)</option>
            <option value="rating">Rating (High → Low)</option>
          </select>
        </div>
      </section>

      {/* Map */}
      <section className="fs-map-section">
        <SchoolsMapEmbed />
      </section>

      {/* Results grid */}
      <section className="fs-results">
        <div className="fs-results-header">
          Showing <strong>{filtered.length}</strong> schools
        </div>

        <div className="fs-grid">
          {visible.map((school) => (
            <FlightSchoolCard key={school.id} school={school} />
          ))}
        </div>

        {/* Sentinel for infinite scroll */}
        {canLoadMore && (
          <div ref={loadMoreRef} className="fs-load-more-sentinel" />
        )}
      </section>
    </main>
  );
}