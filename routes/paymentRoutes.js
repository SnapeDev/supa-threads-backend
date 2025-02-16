import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
const router = express.Router();
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalPrice, shippingInfo } = req.body;

    console.log("Request Body:", req.body); // Debugging

    // Validate input
    if (typeof totalPrice !== "number" || !shippingInfo) {
      throw new Error("Invalid request data");
    }

    // Create PaymentIntent with shipping information
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,

      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      shipping: {
        name: shippingInfo.name,
        address: {
          line1: shippingInfo.address,
          city: shippingInfo.city,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
      },
    });

    console.log("Payment Intent:", paymentIntent); // Debugging

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
