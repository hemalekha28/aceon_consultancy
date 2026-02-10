const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { sendOrderConfirmationEmail } = require('./utils/emailService');

const testEmail = async () => {
  console.log('--- Starting Email Test ---');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'NOT FOUND');
  console.log('MAIL_FROM:', process.env.MAIL_FROM);

  const testOrder = {
    orderId: 'TEST1234',
    orderDate: new Date(),
    items: [
      { name: 'Test Product', quantity: 2, price: 500 }
    ],
    total: 1000,
    shippingAddress: {
      address: '123 Test St',
      city: 'Test City',
      postalCode: '123456',
      country: 'Test Country'
    }
  };

  try {
    console.log('Attempting to send test email to:', process.env.SMTP_USER);
    await sendOrderConfirmationEmail(
      process.env.SMTP_USER, // Send to self for testing
      'Test User',
      testOrder
    );
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email FAILED:');
    console.error(error);
  }
};

testEmail();
