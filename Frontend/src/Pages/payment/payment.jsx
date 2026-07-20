import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const Payment = () => {
  const { propertyId } = useParams();

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Ask backend to create payment and generate signature
      const { data } = await axiosInstance.post("/payment/signature", {
        propertyId,
      });

      if (data.alreadyPaid) {
        alert("You have already unlocked this property's contact.");
        setLoading(false);
        return;
      }

      const formData = {
        amount: data.total_amount,
        tax_amount: "0",
        total_amount: data.total_amount,
        transaction_uuid: data.transaction_uuid,
        product_code: data.product_code,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: "http://localhost:5173/success",
        failure_url: "http://localhost:5173/failure",
        signed_field_names:
          "total_amount,transaction_uuid,product_code",
        signature: data.signature,
      };

      const form = document.createElement("form");
      form.method = "POST";
      form.action =
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;

        form.appendChild(input);
      });

      document.body.appendChild(form);
console.log(formData)
      form.submit();
    } catch (err) {
      console.log(err);
      alert("Payment Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-3xl shadow-xl w-[420px]">

        <h1 className="text-3xl font-bold text-center mb-4">
          Unlock Contact
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Pay Rs. 50 to unlock the owner's phone number and WhatsApp.
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition"
        >
          {loading ? "Redirecting..." : "Pay with eSewa"}
        </button>

      </div>

    </div>
  );
};

export default Payment;