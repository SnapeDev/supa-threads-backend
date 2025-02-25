import { sendEmail } from "./mailgun.js";

sendEmail("your-email@example.com", "Test Email", "This is a test email.")
  .then((res) => console.log("✅ Test email sent successfully:", res))
  .catch((err) => console.error("❌ Failed to send test email:", err));

console.log("✅ Test email sent successfully");
