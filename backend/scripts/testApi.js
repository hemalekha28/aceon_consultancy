const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testApi = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.log('No admin user found');
        process.exit(1);
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const axios = require('axios');

    try {
        const res = await axios.post('http://localhost:5000/api/products', {
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            image: '/uploads/bed2.jpeg',
            category: 'latex',
            stock: 10
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('CREATE SUCCESS:', res.data);

        // Test Update
        const productId = res.data.data.product._id;
        const updateRes = await axios.put(`http://localhost:5000/api/products/${productId}`, {
            price: 150
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('UPDATE SUCCESS:', updateRes.data);

        // Clean up
        await Product.findByIdAndDelete(productId);

    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }

    await mongoose.disconnect();
};

testApi();
