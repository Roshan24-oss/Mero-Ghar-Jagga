import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Failure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const propertyId = searchParams.get("propertyId");

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">

      <div className="bg-white p-8 rounded-3xl shadow-lg w-[420px]">

        <h1 className="text-3xl text-red-600 font-bold text-center">
          Payment Failed ❌
        </h1>

        <p className="text-center mt-5 text-gray-600">
          Your payment could not be completed.
        </p>

        <div className="mt-8 space-y-3">

          <button
            onClick={() => navigate(`/payment/${propertyId}`)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-300 py-3 rounded-xl"
          >
            Back Home
          </button>

        </div>

      </div>

    </div>
  );
};

export default Failure;