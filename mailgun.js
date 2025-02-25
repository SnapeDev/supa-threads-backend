export const sendEmail = async (to, subject, text) => {
  try {
    console.log(`📤 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📝 Text: ${text}`);
    console.log(
      `🔑 Mailgun API Key: ${
        process.env.MAILGUN_API_KEY ? "Exists ✅" : "Not Found ❌"
      }`
    );
    console.log(`🌍 Mailgun Domain: ${process.env.MAILGUN_DOMAIN}`);

    const messageData = {
      from: `Supa Threads <no-reply@supathreads.com>`,
      to,
      subject,
      text,
    };

    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );

    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error);
    throw error;
  }
};
