// webhooks.js
import express from "express";
import Stripe from "stripe";
import { sendEmail } from "../mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        console.log("payment completed");
        const session = event.data.object;

        // Get customer email and order details
        const customerEmail = session.customer_details.email;
        const orderId = session.id;
        const items = JSON.parse(session.metadata.items); // Store item details in metadata during checkout

        // Generate an invoice as text
        const invoiceText = `Thank you for your purchase!\n\nOrder ID: ${orderId}\n\nItems:\n${items
          .map((item) => `- ${item.name} x ${item.quantity} ($${item.price})`)
          .join("\n")}`;

        // Send email
        const data = await sendEmail(
          customerEmail,
          "Your Supa Threads Invoice",
          invoiceText
        );

        console.log(data);
        console.log(`Invoice sent to ${customerEmail}`);
      }

      res.status(200).send();
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;
