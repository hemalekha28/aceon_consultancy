const twilio = require('twilio');

const sendDeliveryOTPSMS = async (phoneNumber, otp, orderId) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not configured. Skipping SMS.');
    return null;
  }

  // Ensure phone number is in E.164 format (e.g., +919876543210)
  let formattedPhone = phoneNumber.toString().trim();
  if (!formattedPhone.startsWith('+')) {
    // Assume India (+91) if no country code given
    formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: `ACEON Mattress: Your delivery OTP for Order #${orderId.toString().slice(-8)} is ${otp}. Valid for 2 hours. Do NOT share with anyone.`,
      from: fromNumber,
      to: formattedPhone
    });
    console.log('Delivery OTP SMS sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending OTP SMS via Twilio:', error.message);
    // Don't throw — SMS failure should not block the email OTP flow
    return null;
  }
};

module.exports = { sendDeliveryOTPSMS };
