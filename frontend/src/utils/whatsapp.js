export const OWNER_PHONE = "919428588040";

export const getProductWhatsAppLink = (product) => {
  const message = `Hello, I'm interested in the *${product.name}* mattress.\n\n*Price:* ₹${product.price}\n*Details:* ${window.location.href}`;
  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};

export const getCustomizerWhatsAppLink = (options, price) => {
  const message = `*Custom Mattress Inquiry*\n\n` +
    `*Size:* ${options.size}\n` +
    `*Thickness:* ${options.thickness} inches\n` +
    `*Material:* ${options.material}\n` +
    `*Comfort:* ${options.comfort}\n` +
    `*Color:* ${options.color.name}\n` +
    `*Features:* ${Object.entries(options.features)
      .filter(([_, active]) => active)
      .map(([name]) => name.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ') || 'Standard'}\n\n` +
    `*Quote:* ₹${price.toLocaleString()}\n` +
    `_Sent from Mattress Customizer_`;
    
  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};
