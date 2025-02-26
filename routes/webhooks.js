// import express from "express";
// import Stripe from "stripe";
// import { sendEmail } from "../mailgun.js";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }), // Use raw body parsing
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const rawBody = req.body; // Use req.body directly (raw)

//     try {
//       // Construct the Stripe event
//       const event = stripe.webhooks.constructEvent(
//         rawBody,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );

//       console.log("Received Stripe event:", event.type);

//       // Handle the checkout.session.completed event
//       if (event.type === "checkout.session.completed") {
//         console.log("Payment completed");
//         const session = event.data.object;

//         // Validate customer email
//         if (!session.customer_details || !session.customer_details.email) {
//           throw new Error("Customer email is missing in the session.");
//         }
//         const customerEmail = session.customer_details.email;

//         // Validate metadata items
//         if (!session.metadata || !session.metadata.items) {
//           throw new Error("Metadata items are missing in the session.");
//         }
//         const items = JSON.parse(session.metadata.items);

//         // Generate an invoice as text
//         const invoiceText = `Thank you for your purchase!\n\nOrder ID: ${
//           session.id
//         }\n\nItems:\n${items
//           .map((item) => `- ${item.name} x ${item.quantity} ($${item.price})`)
//           .join("\n")}`;

//         console.log("Invoice Text:", invoiceText);

//         // Send email
//         try {
//           const data = await sendEmail(
//             customerEmail,
//             "Your Supa Threads Invoice",
//             invoiceText
//           );
//           console.log("Mailgun response:", data);
//           console.log(`Invoice sent to ${customerEmail}`);
//         } catch (emailError) {
//           console.error("Error sending email:", emailError.message);
//           res.status(500).send(`Error sending email: ${emailError.message}`);
//           return;
//         }
//       }

//       res.status(200).send();
//     } catch (error) {
//       console.error("Webhook error:", error.message);
//       console.error("Stack trace:", error.stack);
//       res.status(400).send(`Webhook Error: ${error.message}`);
//     }
//   }
// );

// export default router;

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

      console.log("Received Stripe event:", event.type);

      // Handle the payment_intent.succeeded event
      if (event.type === "payment_intent.succeeded") {
        console.log("Payment succeeded");

        const paymentIntent = event.data.object;

        // Extract email and shipping info
        const customerEmail = paymentIntent.receipt_email;
        const shippingInfo = paymentIntent.shipping;

        // Ensure email exists
        if (!customerEmail) {
          throw new Error("Customer email is missing in the payment intent.");
        }

        // Generate invoice text
        const invoiceText = `Thank you for your purchase!\n\nOrder ID: ${paymentIntent.id}\n\nShipping Information:\nName: ${shippingInfo.name}\nAddress: ${shippingInfo.address.line1}\nCity: ${shippingInfo.address.city}\nPostal Code: ${shippingInfo.address.postal_code}\nCountry: ${shippingInfo.address.country}`;

        console.log("Invoice Text:", invoiceText);

        // Send email
        try {
          const data = await sendEmail(
            customerEmail,
            "Your Supa Threads Invoice",
            invoiceText
          );
          console.log("Mailgun response:", data);
          console.log(`Invoice sent to ${customerEmail}`);
        } catch (emailError) {
          console.error("Error sending email:", emailError.message);
          res.status(500).send(`Error sending email: ${emailError.message}`);
          return;
        }
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
