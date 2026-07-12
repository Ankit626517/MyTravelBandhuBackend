const Inquiry = require('../models/Inquiry');
const VisaTrack = require('../models/VisaTrack');
const sendEmail = require('../utils/sendEmail');
const { getCustomerQuoteTemplate, getCustomerContactTemplate } = require('../utils/emailTemplates');

// Helper to generate a unique Receipt Number for tracking
const generateReceiptNumber = () => {
  return `MTB-${Math.floor(100000 + Math.random() * 900000)}`;
};

// @desc    Submit a holiday quotation request
// @route   POST /api/inquiries/quote
// @access  Public
const createQuoteInquiry = async (req, res) => {
  const { name, phone, email, destination, travelDate, packageType, guests, notes } = req.body;

  try {
    const inquiry = await Inquiry.create({
      type: 'quote',
      name,
      phone,
      email,
      destination,
      travelDate,
      packageType,
      guests,
      message: notes,
    });

    // Automatically generate a visa tracking file if the destination contains "visa"
    let trackingInfo = null;
    const isVisaRelated = destination.toLowerCase().includes('visa');
    if (isVisaRelated) {
      const receiptNumber = generateReceiptNumber();
      trackingInfo = await VisaTrack.create({
        receiptNumber,
        name,
        email,
        phone,
        country: destination.replace(' Visa', ''),
        stage: 1,
        statusText: 'Document Received',
        detail: 'Receipt verified. We have successfully received your physical passport and photograph uploads.'
      });
    }

    // Send email notification to admin
    const emailSubject = `New Holiday Quote Enquiry from ${name}`;
    const emailHtml = `
      <h2>New Holiday Quotation Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Destination:</strong> ${destination}</p>
      <p><strong>Travel Date:</strong> ${travelDate}</p>
      <p><strong>Package Type:</strong> ${packageType}</p>
      <p><strong>Number of Guests:</strong> ${guests}</p>
      <p><strong>Message/Notes:</strong> ${notes || 'None'}</p>
    `;
    
    sendEmail({
      to: 'ankitrathor0661@gmail.com',
      subject: emailSubject,
      html: emailHtml,
    }).catch(err => console.error('Failed to send admin notification email:', err));

    // Send stylish confirmation email to the user (customer)
    const userEmailSubject = `We Have Received Your Holiday Quote Request! ✈️ - My Travel Bandhu`;
    const userEmailHtml = getCustomerQuoteTemplate(name, {
      destination,
      travelDate: travelDate ? new Date(travelDate).toLocaleDateString('en-IN') : 'N/A',
      packageType,
      guests,
      notes,
      phone
    });
    
    sendEmail({
      to: email,
      subject: userEmailSubject,
      html: userEmailHtml,
    }).catch(err => console.error('Failed to send customer confirmation email:', err));

    res.status(201).json({
      message: 'Quotation enquiry submitted successfully!',
      inquiry,
      trackingInfo: trackingInfo ? { receiptNumber: trackingInfo.receiptNumber } : null
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Submit a contact support request
// @route   POST /api/inquiries/contact
// @access  Public
const createContactInquiry = async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  try {
    const inquiry = await Inquiry.create({
      type: 'contact',
      name,
      phone,
      email,
      subject,
      message,
    });

    // Send email notification to admin
    const emailSubject = `New Contact Support Request: ${subject}`;
    const emailHtml = `
      <h2>New Contact Support Enquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;
    
    sendEmail({
      to: 'ankitrathor0661@gmail.com',
      subject: emailSubject,
      html: emailHtml,
    }).catch(err => console.error('Failed to send admin notification email:', err));

    // Send stylish confirmation email to the user (customer)
    const userEmailSubject = `Support Request Received: ${subject} - My Travel Bandhu`;
    const userEmailHtml = getCustomerContactTemplate(name, {
      subject,
      message
    });
    
    sendEmail({
      to: email,
      subject: userEmailSubject,
      html: userEmailHtml,
    }).catch(err => console.error('Failed to send customer confirmation email:', err));

    res.status(201).json({
      message: 'Support request submitted successfully!',
      inquiry
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
const getInquiries = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (inquiry) {
      inquiry.status = req.body.status || inquiry.status;
      const updatedInquiry = await inquiry.save();
      res.json(updatedInquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createQuoteInquiry,
  createContactInquiry,
  getInquiries,
  updateInquiryStatus,
};
