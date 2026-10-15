import * as React from 'react';

export const metadata = {
  title: 'Disclaimer | Khabar Cut News',
  description: 'Disclaimer for Khabar Cut News covering news accuracy, opinion pieces, third-party content, and financial/health advice.',
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">अस्वीकरण (Disclaimer)</h1>
        <p className="text-xs text-gray-500 mt-2">Khabar Cut News Network</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          <strong>Khabar Cut (khabarcut.in)</strong> पर उपलब्ध कराई गई सभी जानकारी केवल सामान्य सूचनात्मक और समाचार उद्देश्यों के लिए है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. समाचार सटीकता (Accuracy of Information)</h2>
        <p>
          यद्यपि हमारी सम्पादकीय टीम हर खबर को प्रकाशित करने से पहले उसकी सत्यता और सटीकता सुनिश्चित करने का हर संभव प्रयास करती है, लेकिन Khabar Cut इस बात की कोई पूर्ण गारंटी नहीं देता कि वेबसाइट पर उपलब्ध सभी जानकारी पूरी तरह से त्रुटिहीन है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. विचार और विचार-विमर्श (Opinion Disclaimer)</h2>
        <p>
          वेबसाइट पर प्रकाशित लेखकों, स्तंभकारों और संपादकीय विचारकों के व्यक्तिगत विचार उनके अपने हैं। जरूरी नहीं कि वे Khabar Cut प्रबंधन या सम्पादकीय मंडल के आधिकारिक रुख का प्रतिनिधित्व करते हों।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. वित्तीय व स्वास्थ्य संबंधी सामग्री (Financial & Health Content)</h2>
        <p>
          शेयर बाजार, निवेश, बजट या स्वास्थ्य सलाह से जुड़ी खबरों को किसी भी स्थिति में पेशेवर वित्तीय या चिकित्सीय सलाह नहीं माना जाना चाहिए। किसी भी निवेश या स्वास्थ्य संबंधी निर्णय लेने से पहले किसी योग्य विशेषज्ञ से परामर्श अवश्य लें।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. विज्ञापनदाता और स्पॉन्सर्ड सामग्री</h2>
        <p>
          हमारी वेबसाइट पर प्रदर्शित होने वाले विज्ञापनों और दावों के लिए संबंधित विज्ञापनदाता स्वयं उत्तरदायी हैं। Khabar Cut किसी भी विज्ञापित उत्पाद या सेवा की गुणवत्ता का समर्थन या गारंटी नहीं देता है।
        </p>
      </div>
    </div>
  );
}
