export const sendBookingEmail = async (
  to: string,
  subject: string,
  html: string,
  senderName: string = "Hostel Management"
) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { 
        name: senderName, 
        email: "adebayoabdulazeez195@gmail.com" // This must be your verified Gmail in Brevo
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Brevo API Error:", data);
    throw new Error("Failed to send email via Brevo API");
  }

  return data;
};