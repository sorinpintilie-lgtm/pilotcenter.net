// MapWithPins.jsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

// custom small circle pin
const pinIcon = L.divIcon({
  className: "custom-pin-icon",
  html: '<span class="custom-pin-dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const locations = [
  {
    id: 1,
    name: "Miami",
    address: "14261 SW 120th St 108 636, Miami, FL 33186",
    position: [25.6481, -80.42287],
  },
  {
    id: 2,
    name: "Goleta",
    address: "5708 Hollister Ave Suite A, Goleta, CA 93117",
    position: [34.43235, -119.80229],
  },
  {
    id: 3,
    name: "London",
    address: "1183, 275 New N Rd, London N1 7AA, UK",
    position: [51.53154, -0.10049],
  },
];

// Child component that handles bounds & markers
function LocationsLayer({ isMobile }) {
  const map = useMap();

  React.useEffect(() => {
    const bounds = L.latLngBounds(locations.map((l) => l.position));

    // fit all pins with different padding on mobile vs desktop
    map.fitBounds(bounds, {
      paddingTopLeft: [isMobile ? 30 : 80, isMobile ? 40 : 80],
      paddingBottomRight: [isMobile ? 30 : 80, isMobile ? 50 : 80],
    });

    // safety: don’t zoom in too much on small screens
    if (isMobile && map.getZoom() > 4) {
      map.setZoom(4);
    }
  }, [map, isMobile]);

  return (
    <>
      {locations.map((loc) => (
        <Marker key={loc.id} position={loc.position} icon={pinIcon}>
          <Popup>
            <strong>{loc.name}</strong>
            <br />
            {loc.address}
            <br />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${loc.position[0]},${loc.position[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              Get Directions
            </a>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function MapWithPins() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // fallback center; real view is controlled by fitBounds above
  const fallbackCenter = [40.0, -30.0];

  return (
    <div className="map-wrapper">
      <h3 className="map-title">Our Locations</h3>
      <p className="map-subtitle">
        You can find us in the US and the UK — choose the closest location.
      </p>

      <MapContainer
        center={fallbackCenter}
        zoom={3}
        scrollWheelZoom={!isMobile}
        className="map-container"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationsLayer isMobile={isMobile} />
      </MapContainer>
    </div>
  );
}