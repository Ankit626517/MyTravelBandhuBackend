const getCustomerQuoteTemplate = (name, details) => {
  const guestsCount = details.guests;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>We Have Received Your Holiday Enquiry!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .logo-section { text-align: center; padding: 35px 20px 20px 20px; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
        .logo-img { height: 70px; max-width: 220px; object-fit: contain; }
        .content { padding: 35px 40px; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; letter-spacing: -0.5px; }
        .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px; }
        .card-title { margin-top: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px 0; font-size: 14px; line-height: 1.5; border-bottom: 1px dashed #f1f5f9; }
        .info-table tr:last-child td { border-bottom: none; }
        .info-label { font-weight: 600; color: #64748b; width: 35%; }
        .info-value { color: #0f172a; font-weight: 500; }
        .next-steps-section { margin-bottom: 30px; }
        .section-header { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .step-item { display: flex; margin-bottom: 12px; }
        .step-number { background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 12px; height: 22px; width: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px; }
        .step-text { font-size: 13.5px; line-height: 1.5; color: #475569; }
        .btn-container { text-align: center; margin-top: 35px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); transition: all 0.2s; }
        .footer { background: #f8fafc; padding: 30px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer-logo { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Brand Header Section -->
        <div class="logo-section">
          <img class="logo-img" src="https://mytravelbandhubackend.onrender.com/uploads/logo.png" alt="My Travel Bandhu" />
        </div>
        
        <div class="content">
          <h2 class="greeting">Hello ${name},</h2>
          <p class="intro">We have successfully received your holiday quotation request. Our destination experts are crafting a personalized itinerary matching your choices. Here is a summary of your request:</p>
          
          <!-- Summary Card -->
          <div class="card">
            <h3 class="card-title">Enquiry Summary</h3>
            <table class="info-table">
              <tr>
                <td class="info-label">Destination</td>
                <td class="info-value">${details.destination}</td>
              </tr>
              <tr>
                <td class="info-label">Travel Date</td>
                <td class="info-value">${details.travelDate}</td>
              </tr>
              <tr>
                <td class="info-label">Package Type</td>
                <td class="info-value">${details.packageType}</td>
              </tr>
              <tr>
                <td class="info-label">Travelers</td>
                <td class="info-value">${guestsCount} Guest(s)</td>
              </tr>
              ${details.notes ? `
              <tr>
                <td class="info-label" style="vertical-align: top;">Custom Notes</td>
                <td class="info-value" style="font-style: italic; color: #475569;">"${details.notes}"</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <!-- Next Steps -->
          <div class="next-steps-section">
            <h3 class="section-header">What to expect next</h3>
            <div class="step-item">
              <span class="step-number">1</span>
              <span class="step-text">Our representative will call you back on <strong>${details.phone}</strong> for quick clarifications.</span>
            </div>
            <div class="step-item">
              <span class="step-number">2</span>
              <span class="step-text">We will share a detailed day-wise customized itinerary on your email.</span>
            </div>
            <div class="step-item">
              <span class="step-number">3</span>
              <span class="step-text">You can change hotels, sightseeing tours, or add private cabs as per your budget.</span>
            </div>
          </div>
          
          <!-- Direct WhatsApp Call to Action -->
          <div class="btn-container">
            <a href="https://wa.me/919522222583?text=Hi!%20I%20have%20submitted%20a%20holiday%20quote%20enquiry." class="btn">
              💬 Discuss Immediately on WhatsApp
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">My Travel Bandhu</div>
          <p>Email: Info.mytravelbandhu@gmail.com | Phone: +91 95222 22583</p>
          <p>12, Connaught Place, New Delhi, India 110001</p>
          <p style="margin-top: 15px; font-size: 11px; color: #94a3b8;">This is a transactional confirmation email regarding your holiday request.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getCustomerContactTemplate = (name, details) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank You for Contacting My Travel Bandhu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .logo-section { text-align: center; padding: 35px 20px 20px 20px; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
        .logo-img { height: 70px; max-width: 220px; object-fit: contain; }
        .content { padding: 35px 40px; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; letter-spacing: -0.5px; }
        .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px; }
        .card-title { margin-top: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px 0; font-size: 14px; line-height: 1.5; border-bottom: 1px dashed #f1f5f9; }
        .info-table tr:last-child td { border-bottom: none; }
        .info-label { font-weight: 600; color: #64748b; width: 35%; }
        .info-value { color: #0f172a; font-weight: 500; }
        .btn-container { text-align: center; margin-top: 35px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s; }
        .footer { background: #f8fafc; padding: 30px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer-logo { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Brand Header Section -->
        <div class="logo-section">
          <img class="logo-img" src="https://mytravelbandhubackend.onrender.com/uploads/logo.png" alt="My Travel Bandhu" />
        </div>
        
        <div class="content">
          <h2 class="greeting">Hello ${name},</h2>
          <p class="intro">Thank you for contacting us. We have successfully logged your query with our support desk, and our team will get in touch with you shortly. Details of your submission:</p>
          
          <!-- Summary Card -->
          <div class="card">
            <h3 class="card-title">Query Details</h3>
            <table class="info-table">
              <tr>
                <td class="info-label">Subject</td>
                <td class="info-value">${details.subject}</td>
              </tr>
              <tr>
                <td class="info-label" style="vertical-align: top;">Your Message</td>
                <td class="info-value" style="color: #475569; font-weight: 400;">${details.message}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 13.5px; line-height: 1.6; color: #64748b;">
            We usually respond to all tickets within 2 hours during active working hours (Mon - Sat, 9:00 AM - 7:00 PM).
          </p>
          
          <!-- Direct WhatsApp Call to Action -->
          <div class="btn-container">
            <a href="https://wa.me/919522222583?text=Hi!%20I%20have%20a%20support%20query." class="btn">
              💬 Speak to Support on WhatsApp
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">My Travel Bandhu</div>
          <p>Email: Info.mytravelbandhu@gmail.com | Phone: +91 95222 22583</p>
          <p>12, Connaught Place, New Delhi, India 110001</p>
          <p style="margin-top: 15px; font-size: 11px; color: #94a3b8;">This is a transactional support confirmation email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getCustomerQuoteTemplate,
  getCustomerContactTemplate,
};
