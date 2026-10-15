import * as React from 'react';

export const metadata = {
  title: 'Privacy Policy | Khabar Cut News',
  description: 'Privacy Policy for Khabar Cut News explaining how we collect, use, protect personal information, cookies, and Google AdSense data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">गोपनीयता नीति (Privacy Policy)</h1>
        <p className="text-xs text-gray-500 mt-2">अंतिम अपडेट: 11 अगस्त 2026 | Khabar Cut Media Network</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          <strong>Khabar Cut (khabarcut.in)</strong> पर हम अपने उपयोगकर्ताओं की गोपनीयता (Privacy) का पूर्ण सम्मान करते हैं। यह गोपनीयता नीति यह स्पष्ट करती है कि हमारी वेबसाइट का उपयोग करते समय आपकी कौन सी जानकारी एकत्र की जाती है और उसका उपयोग कैसे किया जाता है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. जानकारी का संग्रहण (Information We Collect)</h2>
        <p>
          हम दो प्रकार की जानकारी एकत्र कर सकते हैं:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>व्यक्तिगत जानकारी:</strong> जब आप हमारे न्यूज़लेटर की सदस्यता लेते हैं, टिप्पणी (Comment) करते हैं या हमसे संपर्क करते हैं, तब आपका नाम और ईमेल पता।</li>
          <li><strong>गैर-व्यक्तिगत जानकारी:</strong> आपका आईपी एड्रेस (IP Address), ब्राउज़र प्रकार, डिवाइस प्रकार, ऑपरेटिंग सिस्टम और देखे गए पृष्ठ (Page Views)।</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. कुकीज़ और वेब बीकन (Cookies & Web Beacons)</h2>
        <p>
          Khabar Cut उपयोगकर्ता के अनुभवों को बेहतर बनाने के लिए कुकीज़ (Cookies) का उपयोग करता है। कुकीज़ छोटी टेक्स्ट फाइलें होती हैं जो आपके ब्राउज़र में स्टोर होती हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. गूगल एडेंस और थर्ड-पार्टी विज्ञापन (Google AdSense & Third-Party Ads)</h2>
        <p>
          हमारी वेबसाइट पर विज्ञापन दिखाने के लिए गूगल एडसेंस (Google AdSense) और अन्य तृतीय-पक्ष विज्ञापन नेटवर्क का उपयोग किया जा सकता है। गूगल और अन्य विज्ञापनदाता उपयोगकर्ताओं की पिछली विज़िट के आधार पर रुचि-आधारित विज्ञापन (Interest-Based Ads) दिखाने के लिए DART कुकीज़ का उपयोग कर सकते हैं।
        </p>
        <p>
          उपयोगकर्ता <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-[#0057FF] underline">Google Ad Settings</a> पर जाकर रुचि-आधारित विज्ञापनों से बाहर निकल (Opt-out) सकते हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. डेटा सुरक्षा (Data Security)</h2>
        <p>
          आपकी व्यक्तिगत जानकारी को सुरक्षित रखने के लिए हम आधुनिक एन्क्रिप्शन तकनीक (HTTPS/SSL) और कड़े सुरक्षा मानकों का पालन करते हैं। हम आपकी व्यक्तिगत जानकारी को किसी भी तीसरे पक्ष को बेचते या किराए पर नहीं देते हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">5. बाहरी वेबसाइटों के लिंक (Third-Party Links)</h2>
        <p>
          हमारे समाचार लेखों में अन्य प्रासंगिक संदर्भ वेबसाइटों के लिंक शामिल हो सकते हैं। उन बाहरी वेबसाइटों की गोपनीयता नीतियों के लिए Khabar Cut उत्तरदायी नहीं है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">6. गोपनीयता नीति में संशोधन</h2>
        <p>
          Khabar Cut समय-समय पर इस गोपनीयता नीति में संशोधन करने का अधिकार सुरक्षित रखता है। किसी भी बदलाव की जानकारी इसी पृष्ठ पर अपडेट की जाएगी।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">7. संपर्क करें</h2>
        <p>
          यदि इस गोपनीयता नीति के संबंध में आपका कोई प्रश्न है, तो आप हमें <strong>privacy@khabarcut.in</strong> पर ईमेल कर सकते हैं।
        </p>
      </div>
    </div>
  );
}
