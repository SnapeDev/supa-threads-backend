import express from "express";
import { sendEmail } from "../mailgun.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    await sendEmail(email, subject, message);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

export default router;
