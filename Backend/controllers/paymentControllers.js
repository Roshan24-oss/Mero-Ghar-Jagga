import CryptoJS from "crypto-js";
import Payment from "../models/paymentModel.js";
import Property from "../models/Property.js";



export const paymentSignature = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user._id;
    const {total_amount, transaction_uuid, product_code}= req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if already paid
    const alreadyPaid = await Payment.findOne({
      user: userId,
      property: propertyId,
      status: "completed",
    });

    if (alreadyPaid) {
      return res.json({
        success: true,
        alreadyPaid: true,
      });
    }


   

   
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hash = CryptoJS.HmacSHA256(
      hashString,
      process.env.ESEWA_SECRET
    );

    const signature = CryptoJS.enc.Base64.stringify(hash);

    await Payment.create({
      user: userId,
      property: propertyId,
      amount: total_amount,
      transactionId: transaction_uuid,
      status: "pending",
    });
    console.log({
    total_amount,
    transaction_uuid,
    product_code,
    signature,
    secret: process.env.ESEWA_SECRET
});  


    return res.json({
      success: true,
      signature,
      transaction_uuid,
      product_code,
      total_amount,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const verifySignature = async (req, res) => {
  try {
    const {total_amount, transaction_uuid, product_code}=req.body;

    const payment = await Payment.findOne({
      transactionId: transaction_uuid,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "completed") {
      return res.json({
        success: true,
        result: {
          transaction_uuid,
          total_amount: payment.amount,
          status: "COMPLETE",
          propertyId: payment.property,
        },
      });
    }

    const response = await fetch(
      `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`
    );

    const result = await response.json();

    if (result.status === "COMPLETE") {
      payment.status = "completed";
      await payment.save();

      return res.json({
        success: true,
        result: {
          ...result,
          propertyId: payment.property,
        },
      });
    }

    payment.status = "failed";
    await payment.save();

    return res.json({
      success: false,
      result,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




export const checkAccess = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const userId = req.user._id;

    const payment = await Payment.findOne({
      user: userId,
      property: propertyId,
      status: "completed",
    });

    return res.json({
      hasAccess: !!payment,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};