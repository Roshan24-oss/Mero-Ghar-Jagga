import React from "react";
import Navbar from "../components/Navbar.jsx";
import MapView from "../components/MapView.jsx";

const UsersLandingPage = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar takes natural height */}
      <Navbar />

      {/* MapView fills remaining space */}
      <div className="flex-1 mt-16.5">
        <MapView />
      </div>
    </div>
  );
};

export default UsersLandingPage;