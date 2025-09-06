// templates.js — Hindi-only

function formatCurrencyINR(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
}

function formatDateDDMMYY(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function garmentToHindi(items) {
  const itemStr = (items || "").toString().toLowerCase();
  const map = {
    shirt: "शर्ट",
    shirts: "शर्ट",
    pant: "पैंट",
    pants: "पैंट",
    trousers: "पतलून",
    kurta: "कुर्ता",
    suit: "सूट",
    jacket: "जैकेट",
    coat: "कोट",
    blazer: "ब्लेज़र",
    others: "अन्य",
    other: "अन्य",
    "t-shirt": "टी-शर्ट",
    tee: "टी-शर्ट",
    jeans: "जींस",
    dress: "ड्रेस",
  };
  let result = itemStr || "";
  Object.keys(map).forEach((k) => {
    result = result.replace(new RegExp(`\\b${k}\\b`, "gi"), map[k]);
  });
  return result.trim() || "कपड़े";
}

function safe(v, d = "") {
  return v === undefined || v === null ? d : String(v);
}

function generateMessage(type, data = {}) {
  const templates = {
    orderReady: `
🎉 *खुशखबरी! आपके कपड़े तैयार हैं*

📋 *ऑर्डर की जानकारी:*
• ID: *${safe(data.orderId, "-")}*
• कपड़े: *${garmentToHindi(safe(data.garmentTypes, safe(data.item, "")))}*
• तैयार: ${formatDateDDMMYY(safe(data.deliveryDate, safe(data.dueDate, "")))}

💰 *पेमेंट की स्थिति:*
• कुल रकम: ₹*${formatCurrencyINR(safe(data.price, 0))}*
• एडवांस: ₹${formatCurrencyINR(safe(data.advancePayment, 0))}
• बाकी: ₹*${formatCurrencyINR(safe(data.remainingAmount, 0))}*

🏪 कृपया जल्दी लेने आएं

${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    orderConfirm: `
✅ *ऑर्डर कन्फर्म हो गया*

नमस्ते *${safe(data.customerName, "जी")}*,

📋 *आपके ऑर्डर की डिटेल:*
• ऑर्डर नंबर: *${safe(data.orderId, "-")}*
• कपड़े: *${garmentToHindi(safe(data.garmentTypes, safe(data.item, "-")))}*
• ऑर्डर डेट: ${formatDateDDMMYY(safe(data.orderDate, ""))}
• मिलने की डेट: *${formatDateDDMMYY(safe(data.deliveryDate, ""))}*

💰 *पेमेंट:*
• टोटल: ₹*${formatCurrencyINR(safe(data.price, 0))}*
• एडवांस: ₹${formatCurrencyINR(safe(data.advancePayment, 0))}
• बाकी: ₹*${formatCurrencyINR(safe(data.remainingAmount, 0))}*

📱 तैयार होते ही मैसेज मिलेगा

धन्यवाद! 🙏
${safe(data.shopName, "हमारी दुकान")}
`.trim(),

    reminder: `
⏰ *रिमाइंडर - कपड़े लेना है*

प्रिय *${safe(data.customerName, "साहब/मैडम")}*,

• ऑर्डर: *${safe(data.orderId, "-")}*
• कपड़े: ${garmentToHindi(safe(data.garmentTypes, safe(data.item, "-")))}
• बाकी पेमेंट: ₹*${formatCurrencyINR(safe(data.remainingAmount, 0))}*

🏃‍♂️ कृपया जल्दी लेने आएं

${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    fittingReminder: `
📏 *फिटिंग का समय आ गया*

नमस्ते *${safe(data.customerName, "जी")}*,

📋 *फिटिंग अपॉइंटमेंट:*
• ऑर्डर: *${safe(data.orderId, "-")}*
• कपड़े: ${garmentToHindi(safe(data.garmentTypes, safe(data.item, "-")))}
• फिटिंग डेट: *${formatDateDDMMYY(safe(data.fittingDate, ""))}*

⏰ कृपया टाइम पर आइएगा

${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    paymentReminder: `
💳 *पेमेंट रिमाइंडर*

प्रिय *${safe(data.customerName, "ग्राहक")}*,

📋 *पेमेंट की जानकारी:*
• ऑर्डर: *${safe(data.orderId, "-")}*
• कपड़े: ${garmentToHindi(safe(data.garmentTypes, safe(data.item, "-")))}
• कुल रकम: ₹*${formatCurrencyINR(safe(data.price, 0))}*
• दिया गया: ₹${formatCurrencyINR(safe(data.advancePayment, 0))}
• बाकी: ₹*${formatCurrencyINR(safe(data.remainingAmount, 0))}*

💰 कलेक्शन के समय पेमेंट करना है

${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    festivalGreeting: `
🪔 *${safe(data.festival, "त्योहार")} मुबारक!*

प्रिय *${safe(data.customerName, "ग्राहक")}*,

✨ *त्योहार स्पेशल ऑफर*
• नए डिज़ाइन आ गए हैं
• स्पेशल डिस्काउंट
• क्वालिटी फैब्रिक

🎁 अपने फैमिली के लिए बेस्ट कपड़े

आपकी सेवा में हमेशा तत्पर 🙏
${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    delayNotification: `
⏳ *डिलीवरी में थोड़ी देरी*

माफी चाहते हैं *${safe(data.customerName, "जी")}*,

• ऑर्डर: *${safe(data.orderId, "-")}*
• कपड़े: ${garmentToHindi(safe(data.garmentTypes, safe(data.item, "-")))}
• नई डेट: *${formatDateDDMMYY(safe(data.newDeliveryDate, ""))}*

🙏 असुविधा के लिए खेद है

${safe(data.shopName, "हमारी दुकान")}
📞 ${safe(data.shopPhone, "")}
`.trim(),

    qualityCheck: `
✅ *क्वालिटी चेक कम्पलीट*

*${safe(data.customerName, "जी")}*, आपके कपड़े एकदम परफेक्ट हैं!

📋 ऑर्डर: *${safe(data.orderId, "-")}*
🔍 सब कुछ चेक हो गया
💯 क्वालिटी गारंटी के साथ

🎉 अब कलेक्शन के लिए तैयार

${safe(data.shopName, "हमारी दुकान")}
`.trim(),
  };

  const fallback = `नमस्ते *${safe(data.customerName, "जी")}*, धन्यवाद! 🙏`;
  const msg = (templates[type] || fallback).trim();
  return msg.length > 4096 ? msg.slice(0, 4090) + "..." : msg;
}

module.exports = { generateMessage };
