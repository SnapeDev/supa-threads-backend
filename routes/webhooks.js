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
        console.log("Payment completed");

        const session = event.data.object;
        const customerEmail = session.customer_details.email;
        const orderId = session.id;
        const items = JSON.parse(session.metadata.items);

        const invoiceText = `Thank you for your purchase!\n\nOrder ID: ${orderId}\n\nItems:\n${items
          .map((item) => `- ${item.name} x ${item.quantity} ($${item.price})`)
          .join("\n")}`;

        await sendEmail(
          customerEmail,
          "Your Supa Threads Invoice",
          invoiceText
        );
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
