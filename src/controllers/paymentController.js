const axios = require("axios");
const Payment = require("../models/payment-model");
require("dotenv").config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

// Initiate Payment (Creates a payment request)
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, customerId, providerId, serviceId } = req.body;

    if (!amount || !customerId || !providerId || !serviceId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate a unique transaction reference
    const tx_ref = `TX-${Date.now()}`;

    const payment = new Payment({
      amount,
      customer: customerId,
      provider: providerId,
      appointment: serviceId, // If you are storing service bookings
      status: "pending",
      transactionId: tx_ref,
    });

    await payment.save();

    // Flutterwave API request payload
    const paymentData = {
      tx_ref,
      amount,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd",
      redirect_url: `${process.env.BASE_URL}/payment/callback`, // Change as needed
      customer: {
        email: req.user.email, // Assuming email is stored in req.user
        name: req.user.name,
      },
      customizations: {
        title: "Service Payment",
        description: "Payment for service",
        logo: "https://your-logo-url.com/logo.png",
      },
    };

    const response = await axios.post(`${FLW_BASE_URL}/payments`, paymentData, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data.status === "success") {
      res.json({
        message: "Payment initiated",
        link: response.data.data.link, // Flutterwave payment link
      });
    } else {
      res.status(400).json({ message: "Failed to initiate payment" });
    }
  } catch (error) {
    console.error("Payment Initiation Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify Payment (Callback URL handling)
exports.verifyPayment = async (req, res) => {
  const { transaction_id } = req.query; // Flutterwave sends this in the callback URL

  try {
    const response = await axios.get(
      `${FLW_BASE_URL}/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
      }
    );

    if (response.data.status === "success") {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { transactionId: response.data.data.tx_ref },
        { status: "completed" },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }

      res.json({ message: "Payment verified successfully", payment });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


