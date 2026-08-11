import L from "leaflet";
import {
  FaHome,
  FaBuilding,
  FaBed,
} from "react-icons/fa";
import { FaMapMarkedAlt } from "react-icons/fa";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// ================= PROPERTY ICONS =================

const propertyIcons = {
  home: FaHome,
  land: FaMapMarkedAlt,
  office: FaBuilding,
  room: FaBed,
};

// ================= PROPERTY COLORS =================

const propertyColors = {
  home: "#2563eb",   // Blue
  land: "#16a34a",   // Green
  office: "#2563eb", // Blue
  room: "#2563eb",   // Blue
};

// ================= NORMAL PROPERTY ICON =================

export const propertyIcon = (propertyType) => {
  const type = String(propertyType || "home").toLowerCase();

  const Icon = propertyIcons[type] || FaHome;

  const backgroundColor = propertyColors[type] || "#2563eb";

  const iconHtml = renderToStaticMarkup(
    React.createElement(
      "div",
      {
        style: {
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          border: "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        },
      },
      React.createElement(Icon, {
        size: 16,
      })
    )
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// ================= TRENDING PROPERTY ICON =================

export const trendingPropertyIcon = (propertyType) => {
  const type = String(propertyType || "home").toLowerCase();

  const Icon = propertyIcons[type] || FaHome;

  const backgroundColor = propertyColors[type] || "#2563eb";

  const iconHtml = renderToStaticMarkup(
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          width: "32px",
          height: "32px",
        },
      },

      // ================= FIRE ICON =================

      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "-17px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "17px",
            filter: "drop-shadow(0 0 5px orange)",
            zIndex: 2,
          },
        },
        "🔥"
      ),

      // ================= PROPERTY CIRCLE =================

      React.createElement(
        "div",
        {
          style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: backgroundColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            border: "2px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          },
        },
        React.createElement(Icon, {
          size: 16,
        })
      )
    )
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [32, 48],
    iconAnchor: [16, 24],
    popupAnchor: [0, -24],
  });
};

// ================= GET CENTER =================

export const getCenter = (geom) => {
  if (!geom?.coordinates) return null;

  // Point
  if (geom.type === "Point") {
    return geom.coordinates;
  }

  // Polygon
  if (geom.type === "Polygon") {
    const coords = geom.coordinates?.[0];

    return coords?.[Math.floor(coords.length / 2)];
  }

  // LineString
  if (geom.type === "LineString") {
    const coords = geom.coordinates;

    return coords?.[Math.floor(coords.length / 2)];
  }

  return null;
};