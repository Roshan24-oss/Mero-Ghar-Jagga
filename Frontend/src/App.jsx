import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLandingPage from "./Pages/UsersLandingPage";
import SignUp from "./Pages/SignUp.jsx";
import SignIn from "./Pages/SignIn.jsx";
import AddProperty from "./Pages/AddProperty.jsx";
import ProtectedRoute from "../Routes/ProtectedRoute.jsx";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const App = () => {
  return (
    <div className="w-full h-screen">
      <Routes>
        {/* Home page */}
        <Route path="/" element={<UserLandingPage />} />

        {/* Signup page */}
        <Route path="/signup" element={<SignUp />} />

        {/* Sign in page */}
        <Route path="/signin" element={<SignIn />} />

        {/* Protected Route (Owner Only) */}
        <Route
          path="/add-property"
          element={
            <ProtectedRoute requireOwner={true}>
              <AddProperty />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;