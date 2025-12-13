// src/components/SchoolsMapEmbed.jsx
import React from "react";

const MAP_EMBED_URL =
  "https://www.google.com/maps/d/u/0/embed?mid=1W8YNxzxTMp9AV5usp_zCEb4uuQ9TUTI&ehbc=2E312F&noprof=1&z=3&output=embed";

export default function SchoolsMapEmbed() {
  return (
    <div className="fs-map-wrapper" style={{ width: "100%", height: "500px" }}>
      <iframe
        src={MAP_EMBED_URL}
        title="Flight Schools Map"
        style={{
          border: 0,
          width: "100%",
          height: "100%",
          borderRadius: "16px",
        }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}