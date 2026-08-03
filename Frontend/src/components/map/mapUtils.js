import L from "leaflet";

export const profileIcon = (name) =>
  L.divIcon({
    html: `
      <div style="
        width:26px;
        height:26px;
        border-radius:50%;
        background:#2563eb;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        font-size:12px;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">
        ${name ? name.charAt(0).toUpperCase() : "U"}
      </div>
    `,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  });


// ================= TRENDING ICON =================

export const trendingProfileIcon = (name) =>
  L.divIcon({
    html: `
      <div style="position:relative;">

        <div
          style="
            position:absolute;
            top:-16px;
            left:50%;
            transform:translateX(-50%);
            font-size:18px;
            filter:drop-shadow(0 0 6px orange);
          "
        >
          🔥
        </div>

        <div style="
          width:26px;
          height:26px;
          border-radius:50%;
          background:#2563eb;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:bold;
          font-size:12px;
          border:2px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">
          ${name ? name.charAt(0).toUpperCase() : "U"}
        </div>

      </div>
    `,
    className: "",
    iconSize: [26, 42],
    iconAnchor: [13, 21],
    popupAnchor: [0, -20],
  });


// ================= GET CENTER =================

export const getCenter = (geom) => {
  if (!geom?.coordinates) return null;

  if (geom.type === "Point") return geom.coordinates;

  if (geom.type === "Polygon") {
    const coords = geom.coordinates?.[0];
    return coords?.[Math.floor(coords.length / 2)];
  }

  if (geom.type === "LineString") {
    const coords = geom.coordinates;
    return coords?.[Math.floor(coords.length / 2)];
  }

  return null;
};