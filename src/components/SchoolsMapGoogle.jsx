import React, { useEffect, useRef } from "react";

const KML_URL =
  "https://www.google.com/maps/d/u/0/kml?mid=1W8YNxzxTMp9AV5usp_zCEb4uuQ9TUTI";

export default function SchoolsMapGoogle({ onMarkerClick }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    script.async = true;

    script.onload = () => {
      const google = window.google;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 39, lng: -95 },
        zoom: 4,
      });

      const kmlLayer = new google.maps.KmlLayer({
        url: KML_URL,
        map: map,
        preserveViewport: false,
      });

      // Listen for clicks on KML features
      google.maps.event.addListener(kmlLayer, "click", function (event) {
        const name = event.featureData.name;
        const description = event.featureData.description;

        if (onMarkerClick) {
          onMarkerClick({
            name,
            description,
            // Google does not expose lat/lng for KML click directly
            lat: event.latLng?.lat?.() ?? null,
            lng: event.latLng?.lng?.() ?? null,
          });
        }
      });
    };

    document.body.appendChild(script);
  }, [onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}