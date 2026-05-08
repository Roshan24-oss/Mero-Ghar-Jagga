import "../config/env.js"
import nodemailer from "nodemailer";

console.log("EMAIL USER:", process.env.EMAIL_USER);

console.log("EMAIL PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {

  try {

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "OTP Verification",

      html: `
        <div style="font-family:sans-serif">

          <h2>Email Verification</h2>

          <p>Your OTP code is:</p>

          <h1>${otp}</h1>

          <p>This OTP expires in 5 minutes.</p>

        </div>
      `,
    });

    console.log("EMAIL SENT:", info.response);

  } catch (error) {

    console.log("EMAIL ERROR:", error);
  }
};