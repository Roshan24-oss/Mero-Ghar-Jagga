import React from "react";
import Navbar from "../components/Navbar";
import MapView from "./MapView.jsx";
import { useState } from "react";
const UsersLandingPage = ({ searchedLocation, setSearchedLocation }) => {
  const [selectedFilter, setSelectedFilter]=useState("all");
  return (
    <div className="h-screen flex flex-col">
      
      {/* Navbar */}
      <Navbar setSearchedLocation={setSearchedLocation} searchedLocation={searchedLocation} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />

      {/* Map */}
      <div className="flex-1 mt-16">
        <MapView searchedLocation={searchedLocation} selectedFilter={selectedFilter} />
      </div>

    </div>
  );
};

export default UsersLandingPage;