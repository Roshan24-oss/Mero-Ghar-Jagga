import React from 'react'
import MapView from "./components/MapView.jsx"
import "leaflet/dist/leaflet.css";

import UserLandingPage from "./Pages/UsersLandingPage";

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

export default App
