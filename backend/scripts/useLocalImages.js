const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Product = require('../models/Product');

const LOCAL_IMAGES = [
    '/uploads/bed2.jpeg',
    '/uploads/bed3.jpeg',
    '/uploads/bed4.jpeg',
    '/uploads/bed5.jpeg',
    '/uploads/bed6.jpeg',
    '/uploads/bed7.jpeg',
    '/uploads/bed9.jpeg',
    '/uploads/bed10.jpeg',
    '/uploads/bed11.jpeg',
    '/uploads/bed12.jpeg',
    '/uploads/bed13.jpeg'
];

async function updateAllProducts() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not found');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find();
        console.log(`Found ${products.length} products to update`);

        // Assign images mostly sequentially to avoid all random overlap
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const imagePath = LOCAL_IMAGES[i % LOCAL_IMAGES.length];

            product.image = imagePath;
            await product.save();
            console.log(`✅ Updated image for: ${product.name} -> ${product.image}`);
        }

        console.log('✨ All products updated successfully with local images!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
}

updateAllProducts();
