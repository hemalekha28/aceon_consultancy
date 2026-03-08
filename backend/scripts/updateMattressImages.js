const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Product = require('../models/Product');

const MATTRESS_IMAGES = [
    'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=800',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800',
    'https://images.unsplash.com/photo-1556035511-3168381bb4d4?q=80&w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=800',
    'https://images.unsplash.com/photo-1629079447814-2be680d998f4?q=80&w=800'
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

        for (const product of products) {
            const randomImage = MATTRESS_IMAGES[Math.floor(Math.random() * MATTRESS_IMAGES.length)];

            product.image = randomImage;
            await product.save();
            console.log(`✅ Updated image for: ${product.name}`);
        }

        console.log('✨ All products updated successfully with pure mattress images!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
}

updateAllProducts();
