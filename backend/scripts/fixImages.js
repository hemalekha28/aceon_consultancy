const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Product = require('../models/Product');

async function fixBrokenImages() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not found in environment variables');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Images provided by the user
        const userImages = [
            "https://images.thdstatic.com/productImages/f0004c77-3500-41b3-8441-243238d24f28/svn/n-a-avenco-mattresses-hd-o1sm30q00f-64_1000.jpg",
            "https://www.bing.com/th?id=OADD2.1231453040248694_1SDKIW5AB18491B&pid=21.2&c=17&roil=0.2753&roit=0.0745&roir=0.7246&roib=0.9319&w=300&h=300&dynsize=1&qlt=90",
            "https://tse2.mm.bing.net/th/id/OIP.s7IFdYNg41zev_jSAxhdXgHaHa?w=800&h=800&rs=1&pid=ImgDetMain&o=7&rm=3"
        ];

        // Find the first 3 products (the ones most likely failing for the user)
        const products = await Product.find().limit(3);

        if (products.length === 0) {
            console.log('No products found to update.');
        } else {
            for (let i = 0; i < products.length; i++) {
                if (userImages[i]) {
                    products[i].image = userImages[i];
                    await products[i].save();
                    console.log(`✅ Updated image for: ${products[i].name}`);
                }
            }
        }

        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing images:', error);
        process.exit(1);
    }
}

fixBrokenImages();
