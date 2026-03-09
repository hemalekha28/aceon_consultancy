# 📦 Bulk Product Upload Guide

## Overview

The Bulk Product Upload feature allows you to quickly add multiple mattress products to your shop at once. Simply select your product images from your device, fill in the details, and let the system handle the rest!

This feature is designed for non-technical users - no CSV files, no Excel spreadsheets, no complex mappings needed.

---

## Quick Start (3 Simple Steps)

### Step 1: 📸 Upload Your Images
- Click **"Bulk Upload"** button in the Product Management page
- Select multiple product images from your computer (up to 50 images at once)
- Images are automatically uploaded and displayed for preview

### Step 2: 📝 Fill in Product Details
- For each uploaded image, fill in the product information:
  - **Product Name** - e.g., "Premium Memory Foam Mattress 6x6"
  - **Price** - in rupees (₹)
  - **Stock Quantity** - how many items in stock
  - **Material Type** - choose from: Latex, Coir, Memory Foam, Softy Foam, or Spring
  - **Size** - optional, e.g., "6x6", "Queen", "King"
  - **Description** - details about the product

### Step 3: ✅ Upload & Confirm
- Click **"Upload [X] Products"** button
- The system creates all products instantly
- See confirmation of successful uploads

---

## Feature Details

### Image Upload
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Maximum File Size**: 5MB per image
- **Maximum Images**: 50 at once
- **Preview**: See thumbnails of all uploaded images

### Product Form
- **Required Fields** (marked with *):
  - ✓ Product Name
  - ✓ Price
  - ✓ Stock Quantity
  - ✓ Material Type
  - ✓ Description

- **Optional Fields**:
  - Size (e.g., "Queen", "King", "6x6")

### Form Validation
The system automatically checks:
- ✅ All required fields are filled
- ✅ Price is a valid positive number
- ✅ Stock quantity is a valid number (≥ 0)
- ✅ Material type is selected from the predefined list

If you miss something, the system highlights the field in red and shows an error message.

### Success Summary
After uploading, you'll see:
- ✓ Number of successfully created products
- ✓ Names of all created products
- ✓ Any errors (if some products failed)
- ✓ Ability to upload more products or return to management

---

## Tips & Best Practices

### 📸 Image Tips
- **Use clear, well-lit photos** of your mattresses
- **Consistent sizing** makes your shop look professional
- **Name your files descriptively** - it helps if you need to find them later
- **High quality images** (800x800px or larger recommended)

### 📝 Writing Descriptions
- **Be descriptive**: "Premium latex mattress with 100% natural latex, perfect for joint pain relief"
- **Include key features**: firmness level, material composition, warranty, etc.
- **Be honest**: customers appreciate accurate information
- **Keep it under 2000 characters** (plenty of space!)

### 💰 Pricing Guidelines
- Double-check prices before uploading - they're saved immediately
- Prices support decimal values (e.g., 24,999.99)
- Stock quantity affects "In Stock" status displayed to customers

### 🏷️ Categories Explained
- **Latex**: Natural or synthetic latex mattresses
- **Coir**: Coconut fiber-based mattresses
- **Memory Foam**: Temperature-responsive foam mattresses
- **Softy Foam**: Soft foam core mattresses
- **Spring**: Traditional or hybrid spring mattresses

---

## Common Scenarios

### Uploading a Product Line
If you have 10 different mattress models:
1. Select all 10 images at once
2. Fill in details for each one
3. Upload all 10 simultaneously
4. Save time compared to adding them one by one!

### Adding Seasonal Products
- Upload all new seasonal products in bulk
- Faster than the "Add Product" form
- Batch upload 20+ products in minutes

### Correcting Information
- After bulk upload, go to "Product Management"
- Click edit (✏️ icon) on any product to fix details
- Order, reviews, and ratings are preserved

---

## Troubleshooting

### "Image upload failed"
- Check file size (max 5MB each)
- Verify file format (JPG, PNG, GIF, WebP only)
- Try uploading fewer images at once
- Check your internet connection

### "Required field error"
- Look for red highlighted fields
- Make sure you've entered:
  - Product name
  - Price (must be > 0)
  - Stock quantity (number only)
  - Select a material type
  - Description (2000 chars max)

### "Invalid category"
- The system only accepts predefined categories
- Choose one from the dropdown:
  - latex
  - coir
  - memory-foam
  - softy-foam
  - spring

### "Cannot upload more than 100 products"
- Break into smaller batches (max 100 per upload)
- Upload 50 products, then upload the next batch

### Images not showing up
- The system accepts filenames only (not URLs)
- Previously uploaded images will have filenames like: "mattress-1709234056789.jpg"
- When editing, use these filenames, not external URLs

---

## What Happens After Upload?

✅ **Immediately**:
- Products appear in your Product Management list
- Products can be purchased by customers
- Stock counts are active (customers can't buy more than stock)

📊 **Database**:
- Product details are securely stored
- Images are saved on your server
- Each product has a unique ID

📸 **Customer View**:
- Products appear in your product catalog
- Customers see the images, prices, and descriptions you provided
- Stock "In Stock" / "Out of Stock" status is displayed

---

## Advanced Features

### Editing After Upload
After bulk upload:
1. Go to "Product Management"
2. Click the Edit (✏️) button on any product
3. Modify any field
4. Click "Update Product"

### Deleting Products
1. Go to "Product Management"
2. Click the Delete (🗑️) icon on a product
3. Confirm deletion
*(Note: This is permanent and removes all reviews/ratings)*

### Searching Products
- Use the search bar to find products by name or category
- Helpful when managing large product catalogs

---

## FAQ

**Q: Can I upload products with external image URLs?**
A: No, the bulk upload only accepts images from your device. Upload your images first, and the system provides filenames to use.

**Q: What's the maximum number of products at once?**
A: 100 products per upload. You can do multiple uploads to add more.

**Q: Will my old products be affected?**
A: No, bulk upload only adds new products. Existing products remain unchanged.

**Q: Can I upload the same image for multiple products?**
A: Yes, upload the image once, and you can use the same filename for multiple products during form filling.

**Q: Are prices in USD or INR?**
A: Prices are in INR (Indian Rupees). The system shows the ₹ symbol.

**Q: What if a product fails to upload?**
A: You'll see an error message with the reason. Fix the issue and re-upload just that product.

---

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Verify all required fields are completed
3. Try uploading fewer products at once
4. Check your internet connection
5. Contact technical support if problems persist

---

## Excel/CSV Alternative

If you prefer using Excel or CSV:
1. Create a spreadsheet with these columns:
   - Product Name
   - Price
   - Stock
   - Category
   - Description
   - Image Filename

2. Use the traditional "Add Product" form and copy-paste details
3. Or contact your technical team to set up CSV import functionality

---

## Summary

The Bulk Product Upload feature is designed to be:
- ✅ **Easy** - No technical knowledge required
- ✅ **Fast** - Upload 50+ products in minutes
- ✅ **Safe** - Built-in validation prevents errors
- ✅ **Visual** - See images while filling details
- ✅ **Flexible** - Edit anytime after upload

Start uploading your products today and grow your catalog quickly!

---

**Version**: 1.0
**Last Updated**: March 2026
**Designed for**: Non-technical shop owners and admin users
