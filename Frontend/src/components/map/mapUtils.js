import L from "leaflet";

export const profileIcon = (name) =>
  L.divIcon({
    html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:#2563eb;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        border:2px solid white;
      ">
        ${name ? name.charAt(0).toUpperCase() : "U"}
      </div>
    `,
    className: "",
    iconSize: [32, 32],
  });

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