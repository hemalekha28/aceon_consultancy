
/**
 * WhatsApp Utility for ACEON Mattress Store
 */

export const OWNER_PHONE = "919876543210"; // Default owner number

/**
 * Generates a WhatsApp link for a standard product
 */
export const getProductWhatsAppLink = (product, quantity) => {
  const message = `Hello, I want to order this mattress.

Product Name: ${product.name}
Price: ₹${product.price.toLocaleString()}
Quantity: ${quantity}
Size: ${product.size || 'Standard'}
Thickness: ${product.thickness ? product.thickness + '"' : 'N/A'}
Foam Type: ${product.category || 'Premium'}

Customer Details:
- Name: [Your Name]
- Address: [Your Full Delivery Address]
- Pincode: [Your Pincode]

Please confirm availability and delivery date.`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Generates a WhatsApp link for a customized mattress
 */
export const getCustomizerWhatsAppLink = (options, price) => {
  const message = `Hello, I want to order a customized mattress.

Customization Details:
- Size: ${options.size}
- Thickness: ${options.thickness} inch
- Material: ${options.material}
- Comfort Level: ${options.comfort}
- Color: ${options.color.name}

Add-on Features:
- Cooling Gel: ${options.features.coolingGel ? 'Yes' : 'No'}
- Motion Isolation: ${options.features.motionIsolation ? 'Yes' : 'No'}
- Anti Allergy Fabric: ${options.features.antiAllergy ? 'Yes' : 'No'}

Estimated Price: ₹${price.toLocaleString()}

Customer Details:
- Name: [Your Name]
- Address: [Your Full Delivery Address]
- Pincode: [Your Pincode]

Please confirm order and provide delivery details.`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};
