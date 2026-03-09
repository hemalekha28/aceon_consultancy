const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../utils/emailService");

exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, coupon, totalAmount, subtotal, shipping, tax } = req.body;

    // Validate products and calculate total
    let calculatedTotal = 0;
    let discountAmount = 0;
    const orderProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      });

      calculatedTotal += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Use the provided totalAmount if available (which includes discount), otherwise use calculated
    let finalTotal = calculatedTotal;
    if (coupon && coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
      // If totalAmount is provided, use it (as it's already calculated with discount)
      if (totalAmount) {
        finalTotal = totalAmount;
      } else {
        finalTotal = calculatedTotal - discountAmount;
      }
    } else if (totalAmount) {
      finalTotal = totalAmount;
    }

    const newOrder = new Order({
      user: req.user._id,
      products: orderProducts,
      shippingAddress: shippingAddress || {
        address: "Default Address",
        city: "Default City", 
        postalCode: "00000",
        country: "Default Country"
      },
      total: finalTotal,
      status: 'pending',
      paymentMethod: req.body.paymentMethod === 'razorpay' ? 'online' : 'cash_on_delivery',
      paymentStatus: req.body.paymentStatus || 'pending',
      paymentDetails: req.body.paymentId || req.body.orderId ? {
        paymentId: req.body.paymentId,
        orderId: req.body.orderId,
        status: req.body.paymentStatus || 'pending'
      } : undefined,
      coupon: coupon ? {
        code: coupon.code,
        discountAmount: coupon.discountAmount
      } : undefined
    });

    await newOrder.save();
    
    // Populate user data for email
    const user = await User.findById(req.user._id);
    
    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        user.email,
        user.name,
        {
          orderId: newOrder._id.toString().slice(-8),
          orderDate: newOrder.createdAt,
          total: finalTotal,
          discount: discountAmount,
          items: orderProducts,
          shippingAddress: newOrder.shippingAddress
        }
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({ 
      success: true,
      message: "Order placed successfully", 
      data: { order: newOrder }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get orders of logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price image category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
