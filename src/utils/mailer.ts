export const sendBookingEmail = async (
  to: string,
  subject: string,
  html: string,
  senderName: string = "Hostel Management"
) => {
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
    console.error("Brevo API Error Details:", data); 
    throw new Error(`Email failed: ${data.message || response.statusText}`);
  }

  return data;
};