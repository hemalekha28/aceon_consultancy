const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Order = require('../models/Order');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testOrderUpdate = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const admin = await User.findOne({ role: 'admin' });
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const axios = require('axios');

    try {
        const order = await Order.findOne();
        if (!order) {
            console.log('No order found to test.');
            process.exit(0);
        }
        console.log('Testing order update for ID:', order._id);
        const updateRes = await axios.put(`http://localhost:5000/api/orders/${order._id}/status`, {
            status: 'processing'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('UPDATE SUCCESS:', updateRes.data);
    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }

    await mongoose.disconnect();
};

testOrderUpdate();
