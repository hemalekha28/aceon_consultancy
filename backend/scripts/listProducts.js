const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const listProducts = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({}, 'name category image description');
        console.log('PRODUCTS_START');
        console.log(JSON.stringify(products, null, 2));
        console.log('PRODUCTS_END');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

listProducts();
