export const sendBookingEmail = async (
  to: string,
  subject: string,
  html: string,
  senderName: string = "Hostel Management"
) => {
  
  console.log("Checking API Key exists:", !!process.env.BREVO_API_KEY);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": `${process.env.BREVO_API_KEY}`.trim() 
    },
    body: JSON.stringify({
      sender: { 
        name: senderName, 
        email: "adebayoabdulazeez195@gmail.com" 
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Brevo API Error Details:", data); // This will tell us exactly why it failed
    throw new Error("Failed to send email via Brevo API");
  }

  return data;
};