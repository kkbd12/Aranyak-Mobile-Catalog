import { CartItem, Order, StoreSettings } from '../types';

/**
 * Clean phone number to WhatsApp international format without spaces or symbols.
 * Default for Bangladesh (+880) if local 11-digit number starting with 01 is provided.
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with +, remove +
  let digits = cleaned.replace(/^\+/, '');

  // If local BD format (e.g. 017xxxxxxxx)
  if (digits.startsWith('01') && digits.length === 11) {
    digits = `880${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith('1')) {
    digits = `880${digits}`;
  }

  return digits;
}

export function generateWhatsAppOrderText({
  orderNumber,
  customerName,
  customerPhone,
  orderType,
  deliveryAddress,
  paymentMethod,
  notes,
  items,
  subtotal,
  deliveryFee,
  tax,
  total,
  settings
}: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  deliveryAddress?: string;
  paymentMethod: string;
  notes?: string;
  items: Array<{ name: string; quantity: number; price: number; unit?: string }>;
  subtotal: number;
  deliveryFee: number;
  tax?: number;
  total: number;
  settings: StoreSettings;
}): string {
  const deliveryTypeText = 
    orderType === 'delivery' ? '🛵 হোম ডেলিভারি' :
    orderType === 'takeaway' ? '🛍️ শপ পিকআপ' : '📦 কুরিয়ার পার্সেল';

  const paymentMethodText = 
    paymentMethod === 'bkash' ? 'bKash (বিকাশ)' :
    paymentMethod === 'nagad' ? 'Nagad (নগদ)' :
    paymentMethod === 'cash' ? 'ক্যাশ অন ডেলিভারি' : 'কার্ড / ব্যাংক';

  let text = `🛒 *নতুন অর্ডার #${orderNumber}*\n`;
  text += `🏪 *দোকান:* ${settings.storeName}\n\n`;

  text += `👤 *গ্রাহকের তথ্য:*\n`;
  text += `• নাম: ${customerName}\n`;
  text += `• মোবাইল: ${customerPhone}\n`;
  text += `• অর্ডার মাধ্যম: ${deliveryTypeText}\n`;
  if (deliveryAddress && orderType !== 'takeaway') {
    text += `• ডেলিভারি ঠিকানা: ${deliveryAddress}\n`;
  }
  text += `• পেমেন্ট মাধ্যম: ${paymentMethodText}\n\n`;

  text += `📦 *অর্ডারকৃত পণ্যের তালিকা:*\n`;
  items.forEach((item, index) => {
    const unitText = item.unit ? ` (${item.unit})` : '';
    text += `${index + 1}. ${item.name}${unitText} - ${item.quantity}× = ${settings.currencySymbol}${item.price * item.quantity}\n`;
  });
  text += `\n`;

  text += `💵 *বিল বিবরণ:*\n`;
  text += `• আইটেম সাবটোটাল: ${settings.currencySymbol}${subtotal}\n`;
  if (deliveryFee > 0) {
    text += `• ডেলিভারি ফি: ${settings.currencySymbol}${deliveryFee}\n`;
  }
  if (tax && tax > 0) {
    text += `• ভ্যাট/ট্যাক্স: ${settings.currencySymbol}${tax}\n`;
  }
  text += `• *সর্বমোট প্রদেয়:* *${settings.currencySymbol}${total}*\n`;

  if (notes && notes.trim()) {
    text += `\n📝 *বিশেষ নির্দেশনা / নোট:* ${notes.trim()}\n`;
  }

  text += `\n🙏 _ধন্যবাদ! অনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।_`;

  return text;
}

export function openWhatsAppChat({
  phone,
  message
}: {
  phone: string;
  message: string;
}): void {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  
  const url = formattedPhone 
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  // Use window.open with _blank or fallback to location href
  try {
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  } catch {
    window.location.href = url;
  }
}
