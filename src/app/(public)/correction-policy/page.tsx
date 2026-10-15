import * as React from 'react';

export const metadata = {
  title: 'Correction Policy | Khabar Cut News',
  description: 'Correction and Retraction Policy for Khabar Cut News explaining how errors, updates, and retractions are handled.',
};

export default function CorrectionPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">सुधार और संशोधन नीति (Correction Policy)</h1>
        <p className="text-xs text-gray-500 mt-2">Khabar Cut Transparency Protocol</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          <strong>Khabar Cut</strong> अपने पाठकों को सटीक जानकारी देने के लिए प्रतिबद्ध है। यदि किसी प्रकाशित समाचार में अनजाने में कोई तथ्यात्मक त्रुटि होती है, तो हमारी नीति उसे तुरंत और पारदर्शी तरीके से सुधारने की है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. त्रुटियों की रिपोर्ट कैसे करें</h2>
        <p>
          यदि आपको हमारे किसी लेख में कोई तथ्यात्मक गलती, टाइपो या अस्पष्टता दिखाई देती है, तो आप हमें सीधे ईमेल कर सकते हैं:
          <br />
          <strong>Email: corrections@khabarcut.in / editor@khabarcut.in</strong>
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. सुधार की प्रक्रिया (How Corrections Are Made)</h2>
        <p>
          - **तथ्यात्मक सुधार (Fact Correction):** खबर में सुधार करने के साथ-साथ लेख के अंत में एक 'Correction Note' जोड़ा जाता है, जिसमें बताया जाता है कि क्या सुधारा गया है और कब सुधारा गया।
          <br />
          - **अद्यतन (Updates):** लगातार विकसित हो रही खबरों में नए तथ्य जुड़ने पर 'Updated' समय के साथ लेख को अपडेट किया जाता है।
        </p>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. टेकडाउन व रिट्रैक्शन (Retraction)</h2>
        <p>
          यदि कोई खबर पूरी तरह से असत्य या भ्रामक साबित होती है, तो उसे सार्वजनिक स्पष्टीकरण और माफीनामे के साथ वेबसाइट से वापस लिया जाता है।
        </p>
      </div>
    </div>
  );
}
