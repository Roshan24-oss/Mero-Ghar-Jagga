import React from "react";
import MapView from "./components/MapView.jsx";
import UserLandingPage from "./Pages/UsersLandingPage";

// ✅ Correct CSS imports
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const App = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <UserLandingPage />   {/* Navbar */}
      <div className="flex-1">
        <MapView />
      </div>
    </div>
  );
};

export default App;