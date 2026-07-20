import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loading from "./Loading";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const encodedData = searchParams.get("data");

        if (!encodedData) {
          navigate("/failure");
          return;
        }

        // Decode eSewa response
        const esewaData = JSON.parse(atob(encodedData));

        const { data } = await axiosInstance.post("/payment/verify", {
          transaction_uuid: esewaData.transaction_uuid,
        });

        if (!data.success) {
          alert("Payment verification failed.");
          navigate("/failure");
          return;
        }

        setTransaction(data.result);
      } catch (err) {
        console.log(err);
        alert("Something went wrong while verifying payment.");
        navigate("/failure");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-xl rounded-3xl p-8 w-[420px]">

        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          Payment Successful 🎉
        </h1>

        <div className="space-y-4">

          <div className="flex justify-between">
            <span className="font-semibold">Amount</span>
            <span>Rs. {transaction.total_amount}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Status</span>
            <span className="text-green-600">
              {transaction.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">
              Transaction ID
            </span>

            <span className="text-sm">
              {transaction.transaction_uuid}
            </span>
          </div>

        </div>

        <button
          onClick={() =>
            navigate(`/?unlocked=${transaction.propertyId}`)
          }
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
        >
          Back to Property
        </button>

      </div>

    </div>
  );
};

export default Success;