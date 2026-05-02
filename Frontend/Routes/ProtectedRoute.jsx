import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { user } = useContext(AuthContext);

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // ❌ Not owner (if required)
  if (requireOwner && user.role !== "owner") {
    return <Navigate to="/" />;
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;