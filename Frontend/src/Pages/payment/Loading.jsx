import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>

        {/* Text */}
        <h2 className="mt-6 text-xl font-semibold text-gray-800">
          Processing Payment...
        </h2>

        <p className="mt-2 text-gray-500 text-center">
          Please wait while we verify your payment.
          <br />
          Do not close or refresh this page.
        </p>
      </div>
    </div>
  );
};

export default Loading;