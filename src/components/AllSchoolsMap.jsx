// src/components/AllSchoolsMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import schoolsData from "../data/flightschools.json";

// If your project already sets the default Leaflet icon globally somewhere,
// you can delete this block. Otherwise it makes sure markers display correctly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Try to read coordinates from multiple possible field names.
// If your JSON uses different keys, just tell me and I’ll tweak this.
function getCoords(school) {
  const lat =
    school.lat ??
    school.latitude ??
    school.Latitude ??
    school.LAT ??
    school["Latitude"];
  const lng =
    school.lng ??
    school.lon ??
    school.longitude ??
    school.Longitude ??
    school.LNG ??
    school["Longitude"];

  if (lat == null || lng == null) return null;

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;

  return { lat: latNum, lng: lngNum };
}

export default function AllSchoolsMap() {
  const markers = useMemo(() => {
    return schoolsData
      .map((school) => {
        const coords = getCoords(school);
        if (!coords) return null;
        return {
          id: school.id,
          name: school.name,
          city: school.city,
          country: school.country,
          ...coords,
        };
      })
      .filter(Boolean);
  }, []);

  const defaultCenter = [20, 0]; // world-ish center
  const defaultZoom = 2;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup>
            <strong>{m.name}</strong>
            <br />
            {[m.city, m.country].filter(Boolean).join(", ")}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}