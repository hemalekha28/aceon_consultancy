
/**
 * WhatsApp Utility for ACEON Mattress Store
 */

export const OWNER_PHONE = "919876543210"; // Default owner number

/**
 * Generates a WhatsApp link for a standard product inquiry
 */
export const getProductWhatsAppLink = (product) => {
  const message = `Hello ACEON, I have a query about this mattress:

Product Name: ${product.name}
Price: ₹${product.price.toLocaleString()}
Category: ${product.category || 'Premium'}

Can you please provide more details about availability and features?`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Generates a WhatsApp link for a customized mattress inquiry
 */
export const getCustomizerWhatsAppLink = (options, price) => {
  const message = `Hello ACEON, I'm interested in a customized mattress with these specs:

- Size: ${options.size}
- Thickness: ${options.thickness} inch
- Material: ${options.material}
- Comfort: ${options.comfort}
- Color: ${options.color.name}
- Add-ons: ${Object.entries(options.features)
    .filter(([_, active]) => active)
    .map(([name]) => name.replace(/([A-Z])/g, ' $1').trim())
    .join(', ') || 'None'}

Estimated Price: ₹${price.toLocaleString()}

Could you please help me with the ordering process and delivery time for this configuration?`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};
