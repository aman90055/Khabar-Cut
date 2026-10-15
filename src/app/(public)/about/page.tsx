import * as React from 'react';
import { ShieldCheck, Award, Users, Globe, Target, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Khabar Cut News',
  description: 'Learn about Khabar Cut News, our editorial team, mission, values, and commitment to independent, verified journalism.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 xl:px-10 py-10 space-y-12">
      {/* Hero Section */}
      <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-8 sm:p-12 shadow-sm space-y-4 text-center max-w-4xl mx-auto">
        <span className="kc-badge bg-[#D90429] text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
          हमारे बारे में (About Khabar Cut)
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight font-display">
          निष्पक्ष, सटीक और विश्वसनीय पत्रकारिता
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Khabar Cut (खबर कट) एक स्वतंत्र और डिजिटल-फ़र्स्ट समाचार संस्थान है जिसका मुख्य उद्देश्य देश और राज्यों की सटीक, निष्पक्ष और सत्यापित ख़बरें आम जनता तक पहुँचाना है।
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-[#D90429] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">हमारा लक्ष्य (Our Mission)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            बिना किसी राजनीतिक या व्यावसायिक दबाव के, आम लोगों के मुद्दों, युवा रोजगार, जमीनी समस्याओं और राष्ट्रीय घटनाओं को बिना मिर्च-मसाले के जनता के सामने पेश करना।
          </p>
        </div>

        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#0057FF] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">फैक्‍ट चैकिंग व सत्यता</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            हमारी सम्पादकीय टीम हर खबर को प्रकाशित करने से पहले कम से कम दो विश्वसनीय स्रोतों से सत्यापित करती है। फेक न्यूज और भ्रामक दावों से हमारी शून्य सहनशीलता है।
          </p>
        </div>

        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">व्यापक राष्ट्रीय कवरेज</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            झारखंड, बिहार, उत्तर प्रदेश, दिल्ली और देश के सभी राज्यों की जमीनी खबरों के साथ-साथ टेक, बिजनेस, खेल और अंतरराष्ट्रीय राजनीति पर गहरी पकड़।
          </p>
        </div>
      </div>

      {/* Editorial Ethics */}
      <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display border-l-4 border-[#D90429] pl-3">
          सम्पादकीय सिद्धांत (Editorial Principles)
        </h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            <strong>1. स्वतंत्रता और निष्पक्षता:</strong> Khabar Cut किसी भी राजनीतिक दल, कॉर्पोरेट समूह या दबाव समूह से स्वतंत्र है। हमारा एकमात्र जवाबदेही हमारे पाठकों के प्रति है।
          </p>
          <p>
            <strong>2. पारदर्शिता:</strong> यदि हम से कोई अनजाने में त्रुटि होती है, तो हम अपनी सम्पादकीय नीति के अनुसार तुरंत और सार्वजनिक रूप से सुधार (Correction) प्रकाशित करते हैं।
          </p>
          <p>
            <strong>3. विज्ञापनों का स्पष्टीकरण:</strong> सम्पादकीय सामग्री और प्रायोजित/विज्ञापन सामग्री के बीच स्पष्ट अंतर रखा जाता है। स्पॉन्सर्ड पोस्ट्स को स्पष्ट रूप से 'Sponsored' चिह्नित किया जाता है।
          </p>
        </div>
      </div>

      {/* Contact Prompt */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">क्या आपके पास कोई सुझाव या खबर है?</h3>
        <div className="flex justify-center gap-4">
          <Link href="/contact" className="bg-[#D90429] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
            संपर्क करें (Contact Us)
          </Link>
          <Link href="/editorial-policy" className="border border-gray-300 dark:border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            सम्पादकीय नीति पढ़ें
          </Link>
        </div>
      </div>
    </div>
  );
}
