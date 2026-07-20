import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import UsersLandingPage from "./Pages/UsersLandingPage";
import SignUp from "./Pages/SignUp.jsx";
import SignIn from "./Pages/SignIn.jsx";
import AddProperty from "./Pages/AddProperty.jsx";
import ProtectedRoute from "../Routes/ProtectedRoute.jsx";
import SavedProperties from "./Pages/SavedProperties.jsx";
import Failure from "./Pages/payment/Faliur.jsx";
import Success from "./Pages/payment/Success.jsx";
import Loading from "./Pages/payment/Loading.jsx";
import Payment from "./Pages/payment/payment.jsx";

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
      <Route
        path="/saved-properties"
        element={
          <ProtectedRoute>
            <SavedProperties />
          </ProtectedRoute>
        }
      />
      <Route path="/faliure" element={<Failure />} />
      <Route path="/success" element={<Success />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/payment/:propertyId" element={<Payment />} />
    </Routes>
  );
};

export default App;