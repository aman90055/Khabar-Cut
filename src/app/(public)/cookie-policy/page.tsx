import * as React from 'react';

export const metadata = {
  title: 'Cookie Policy | Khabar Cut News',
  description: 'Cookie Policy explaining the use of cookies, analytics, and AdSense ad personalization on Khabar Cut News.',
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">कुकी नीति (Cookie Policy)</h1>
        <p className="text-xs text-gray-500 mt-2">Khabar Cut News Network</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          यह कुकी नीति यह स्पष्ट करती है कि <strong>Khabar Cut (khabarcut.in)</strong> आपकी प्राथमिकताओं को याद रखने और बेहतर यूजर एक्सपीरियंस प्रदान करने के लिए कुकीज़ का उपयोग कैसे करता है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. कुकीज़ क्या हैं?</h2>
        <p>
          कुकीज़ छोटी डेटा फाइलें होती हैं जो आपके वेब ब्राउज़र में तब स्टोर होती हैं जब आप किसी वेबसाइट पर जाते हैं। यह वेबसाइट को आपकी पसंद (जैसे डार्क मोड / लाइट मोड) याद रखने में मदद करती हैं।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. हम किन कुकीज़ का उपयोग करते हैं?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>आवश्यक कुकीज़:</strong> वेबसाइट की बुनियादी कार्यप्रणाली और सुरक्षा के लिए आवश्यक।</li>
          <li><strong>एनालिटिक्स कुकीज़:</strong> गूगल एनालिटिक्स के माध्यम से यह समझने के लिए कि कौन से समाचार पृष्ठ सबसे अधिक पढ़े जा रहे हैं।</li>
          <li><strong>विज्ञापन कुकीज़:</strong> गूगल एडेंस द्वारा प्रासंगिक और रुचि-आधारित विज्ञापन प्रदर्शित करने के लिए।</li>
        </ul>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. कुकीज़ को कैसे प्रबंधित करें</h2>
        <p>
          आप अपने वेब ब्राउज़र की सेटिंग्स में जाकर कुकीज़ को ब्लॉक या डिलीट कर सकते हैं। हालांकि, कुकीज़ को अक्षम करने से वेबसाइट की कुछ विशेषताएं ठीक से काम नहीं कर सकती हैं।
        </p>
      </div>
    </div>
  );
}
