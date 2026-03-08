const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Product = require('../models/Product');

const NEW_CATEGORIES = ['latex', 'coir', 'memory-foam', 'softy-foam', 'spring'];

async function updateCategories() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not found');
            process.exit(1);
        }

        // Temporarily bypass strict schema validation for the old values during fetch
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // We can fetch them bypassing model validations
        const products = await Product.find({}, null, { strict: false });
        console.log(`Found ${products.length} products to update`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            if (!NEW_CATEGORIES.includes(product.category)) {
                // Map old category to one of the new ones
                const newCategory = NEW_CATEGORIES[i % NEW_CATEGORIES.length];
                // Uses updateOne to bypass mongoose's strict full-document validation if other fields fail temporarily
                await Product.updateOne({ _id: product._id }, { $set: { category: newCategory } }, { runValidators: false });
                console.log(`✅ Updated category for: ${product.name} -> ${newCategory}`);
            } else {
                console.log(`❕ Kept category for: ${product.name} -> ${product.category}`);
            }
        }

        console.log('✨ All product categories migrated successfully!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating categories:', error);
        process.exit(1);
    }
}

updateCategories();
