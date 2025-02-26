import express from "express";
import Stripe from "stripe";
import { sendEmail } from "../mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }), // Use raw body parsing
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const rawBody = req.body; // Use req.body directly (raw)

    try {
      // Construct the Stripe event
      const event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        console.log("Payment completed");
        const session = event.data.object;

        // Validate customer email
        if (!session.customer_details || !session.customer_details.email) {
          throw new Error("Customer email is missing in the session.");
        }
        const customerEmail = session.customer_details.email;

        // Validate metadata items
        if (!session.metadata || !session.metadata.items) {
          throw new Error("Metadata items are missing in the session.");
        }
        const items = JSON.parse(session.metadata.items);

        // Generate an invoice as text
        const invoiceText = `Thank you for your purchase!\n\nOrder ID: ${
          session.id
        }\n\nItems:\n${items
          .map((item) => `- ${item.name} x ${item.quantity} ($${item.price})`)
          .join("\n")}`;

        // Send email
        const data = await sendEmail(
          customerEmail,
          "Your Supa Threads Invoice",
          invoiceText
        );

        console.log("Mailgun response:", data);
        console.log(`Invoice sent to ${customerEmail}`);
      }

      res.status(200).send();
    } catch (error) {
      console.error("Webhook error:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;
