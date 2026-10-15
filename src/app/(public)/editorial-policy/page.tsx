import * as React from 'react';

export const metadata = {
  title: 'Editorial Policy | Khabar Cut News',
  description: 'Editorial Policy and Ethics Standards of Khabar Cut News including fact-checking, impartiality, sourcing, and AI disclosure.',
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">सम्पादकीय नीति (Editorial Policy)</h1>
        <p className="text-xs text-gray-500 mt-2">Google News Transparency Compliance | Khabar Cut Newsroom</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          <strong>Khabar Cut</strong> डिजिटल पत्रकारिता के उच्चतम नैतिक मानकों और उत्तरदायित्व का पालन करता है। हमारी सम्पादकीय नीति हमारे संवाददाताओं और सम्पादकों को पारदर्शी, सत्यवादी और निष्पक्ष रिपोर्टिंग के लिए निर्देशित करती है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. सत्यता और तथ्य-जांच (Fact-Checking Standard)</h2>
        <p>
          हम बिना गहन तथ्य-जांच के कोई खबर प्रकाशित नहीं करते। प्रत्येक रिपोर्ट को प्रकाशित करने से पहले आधिकारिक बयानों, प्राथमिक दस्तावेजों या दो स्वतंत्र स्रोतों से क्रॉस-वेरीफाई किया जाता है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. निष्पक्षता और संतुलन (Impartiality & Fairness)</h2>
        <p>
          जब किसी विवाद या आरोप से जुड़ी खबर रिपोर्ट की जाती है, तो हम संबंधित सभी पक्षों का दृष्टिकोण और पक्ष शामिल करने का ईमानदारी से प्रयास करते हैं। हमारी रिपोर्टिंग किसी भी राजनीतिक दल या कॉर्पोरेट दबाव से मुक्त होती है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. स्रोतों की गोपनीयता (Confidentiality of Sources)</h2>
        <p>
          हम अपने संवाददाताओं और स्रोतों की गोपनीयता का सम्मान करते हैं। अनाम स्रोतों का उपयोग केवल तभी किया जाता है जब सार्वजनिक हित सर्वोपरि हो और स्रोत की पहचान का खुलासा करने से उनकी सुरक्षा को खतरा हो।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. एआई और स्वचालन नीति (AI Content Disclosure)</h2>
        <p>
          यदि किसी रिपोर्ट में एआई टूल्स का उपयोग केवल भाषा सुधार या डेटा विश्लेषण के लिए किया जाता है, तो भी उसका अंतिम संपादन और तथ्य-जांच मानव सम्पादक (Human Editor) द्वारा ही की जाती है।
        </p>
      </div>
    </div>
  );
}
