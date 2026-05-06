import React from "react";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";

const UsersLandingPage = ({ searchedLocation, setSearchedLocation }) => {
  return (
    <div className="h-screen flex flex-col">
      
      {/* Navbar */}
      <Navbar setSearchedLocation={setSearchedLocation} />

      {/* Map */}
      <div className="flex-1 mt-16">
        <MapView searchedLocation={searchedLocation} />
      </div>

    </div>
  );
};

export default UsersLandingPage;