import { sendEmail } from "./mailgun.js"; // Update the correct path

sendEmail(
  "jacksnapephotography@outlook.com",
  "Test Email",
  "Hello, this is a test!"
)
  .then(() => console.log("Success ✅"))
  .catch((error) => console.error("Failed ❌", error));
