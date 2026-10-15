import * as React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Khabar Cut News',
  description: 'Terms and Conditions of Service for using Khabar Cut News portal, intellectual property rights, and user conduct rules.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">नियम और शर्तें (Terms & Conditions)</h1>
        <p className="text-xs text-gray-500 mt-2">अंतिम अपडेट: 11 अगस्त 2026 | Khabar Cut News Network</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          <strong>Khabar Cut (khabarcut.in)</strong> में आपका स्वागत है। हमारी वेबसाइट का उपयोग करके आप निम्नलिखित नियमों और शर्तों का पूर्णतः पालन करने के लिए सहमति व्यक्त करते हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. बौद्धिक संपदा अधिकार (Intellectual Property Rights)</h2>
        <p>
          Khabar Cut पर प्रकाशित सभी समाचार लेख, तस्वीरें, वीडियो, लोगो, ग्राफिक्स और लेआउट हमारी बौद्धिक संपदा हैं। बिना लिखित अनुमति के हमारी सामग्री का व्यावसायिक पुनरुत्पादन या कॉपीराइट उल्लंघन सख्त वर्जित है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. उपयोगकर्ता आचरण और टिप्पणियां (User Conduct)</h2>
        <p>
          हमारी वेबसाइट पर टिप्पणियां (Comments) पोस्ट करते समय उपयोगकर्ताओं को निम्नलिखित बातों का ध्यान रखना अनिवार्य है:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>किसी भी प्रकार की अभद्र, सांप्रदायिक, अपमानजनक या असंसदीय भाषा का प्रयोग न करें।</li>
          <li>स्पैम या वाणिज्यिक विज्ञापनों वाले लिंक पोस्ट करना प्रतिबंधित है।</li>
          <li>Khabar Cut के सम्पादक मंडल को किसी भी अनुचित टिप्पणी को हटाने या ब्लॉक करने का पूर्ण अधिकार है।</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. समाचार सटीकता और कॉपीराइट</h2>
        <p>
          Khabar Cut पत्रकारिता के उच्चतम मानकों का पालन करता है। हम केवल सत्यापित और तथ्य-आधारित समाचार प्रकाशित करते हैं। यदि किसी तीसरे पक्ष को अपनी सामग्री पर कॉपीराइट का दावा करना हो, तो वे हमारी डिजिटल शिकायत टीम से संपर्क कर सकते हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. सेवा में परिवर्तन</h2>
        <p>
          हम बिना किसी पूर्व सूचना के अपनी वेबसाइट की किसी भी सेवा, अनुभाग या सामग्री में बदलाव करने या उसे बंद करने का अधिकार सुरक्षित रखते हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">5. क्षेत्राधिकार (Jurisdiction)</h2>
        <p>
          इन्फॉर्मेशन टेक्नोलॉजी एक्ट 2000 तथा भारतीय कानूनों के तहत उत्पन्न किसी भी कानूनी विवाद का निपटारा केवल रांची (झारखंड) न्यायालय के क्षेत्राधिकार के अंतर्गत होगा।
        </p>
      </div>
    </div>
  );
}
