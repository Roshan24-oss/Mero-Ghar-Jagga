import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import UsersLandingPage from "./Pages/UsersLandingPage";
import SignUp from "./Pages/SignUp.jsx";
import SignIn from "./Pages/SignIn.jsx";
import AddProperty from "./Pages/AddProperty.jsx";
import ProtectedRoute from "../Routes/ProtectedRoute.jsx";

const App = () => {
  const [searchedLocation, setSearchedLocation] = useState(null);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <UsersLandingPage
            searchedLocation={searchedLocation}
            setSearchedLocation={setSearchedLocation}
          />
        }
      />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route
        path="/add-property"
        element={
          <ProtectedRoute requireOwner={true}>
            <AddProperty />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;