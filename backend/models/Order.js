const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    category: { 
      type: String, 
      enum: ['latex', 'coir', 'memory-foam', 'softy-foam', 'spring']
    }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    // Optional geolocation coordinates for delivery address
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  shipping: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  deliveryDetails: {
    baseCharge: { type: Number, default: 0 },
    distanceCharge: { type: Number, default: 0 },
    distance: { type: Number },
    estimatedDays: { type: Number }
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentDetails: {
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    status: { type: String },
    method: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'INR' },
    refundStatus: { type: String },
    refundAmount: { type: Number, default: 0 },
    captured: { type: Boolean, default: false },
    email: { type: String },
    contact: { type: String },
    fee: { type: Number },
    tax: { type: Number },
    errorCode: { type: String },
    errorDescription: { type: String },
    bank: { type: String },
    wallet: { type: String },
    vpa: { type: String },
    cardId: { type: String },
    bankTransactionId: { type: String },
    international: { type: Boolean, default: false },
    upiTransactionId: { type: String },
    upiVpa: { type: String },
    upiResponseCode: { type: String },
    upiApprovalRefNo: { type: String },
    acquirerData: {
      rrn: { type: String },
      upiTransactionId: { type: String },
      upiResponseCode: { type: String },
      upiApprovalRefNo: { type: String },
      aadhaarNumber: { type: String },
      arn: { type: String },
      bankTransactionId: { type: String },
      paymentId: { type: String },
      referenceNo: { type: String },
      statusCode: { type: String },
      statusDescription: { type: String },
      transactionTimestamp: { type: Date },
      utr: { type: String }
    }
  },
  driverLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date }
  },
  coupon: {
    code: { type: String, uppercase: true },
    discountAmount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Order', orderSchema);