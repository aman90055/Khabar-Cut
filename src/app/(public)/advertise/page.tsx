import * as React from 'react';
import { BarChart2, Users, Target, Mail, Send } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Advertise With Us | Khabar Cut News',
  description: 'Advertise on Khabar Cut News. Explore display ads, sponsored content, native placements, and media kit.',
};

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-10 space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="kc-badge bg-[#F6B100] text-black border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
          विज्ञापन व मीडिया पार्टनरशिप
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight">
          Khabar Cut के साथ अपने ब्रांड की पहुँच बढ़ाएं
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          हिंदी भाषी राज्यों (झारखंड, बिहार, उत्तर प्रदेश, दिल्ली) के लाखों पाठकों तक अपने उत्पाद और सेवाओं का प्रचार करें।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-[#D90429] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">2.5M+</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">मासिक पाठक (Monthly Readers)</p>
        </div>

        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#0057FF] flex items-center justify-center mx-auto">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">85%</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">युवा व पेशेवर ऑडियंस (Age 18-44)</p>
        </div>

        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">हाई CTR</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">विज्ञापन पर बेहतर रिस्पॉन्स</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-[#F6B100] pl-3">
          विज्ञापन के विकल्प (Advertising Options)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
          <div className="space-y-2 border border-gray-100 dark:border-white/5 p-4 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-white">1. डिस्प्ले बैनर एड्स (Display Banner Ads)</h4>
            <p className="text-xs text-gray-500">हेडर 728x90, इन-आर्टिकल 300x250, साइडबार व मोबाइल स्टिकी बैनर स्लॉट्स।</p>
          </div>
          <div className="space-y-2 border border-gray-100 dark:border-white/5 p-4 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-white">2. स्पॉन्सर्ड आर्टिकल्स (Sponsored Posts)</h4>
            <p className="text-xs text-gray-500">Google नीतियों के तहत पारदर्शी स्पॉन्सर्ड लेबलिंग के साथ ब्रांड स्टोरी।</p>
          </div>
          <div className="space-y-2 border border-gray-100 dark:border-white/5 p-4 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-white">3. वीडियो व वेब स्टोरीज़ एड्स</h4>
            <p className="text-xs text-gray-500">वेब स्टोरीज़ और वीडियो सेक्शन में ब्रांड प्लेसमेंट।</p>
          </div>
          <div className="space-y-2 border border-gray-100 dark:border-white/5 p-4 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-white">4. न्यूज़लेटर व पुश नोटिफिकेशन</h4>
            <p className="text-xs text-gray-500">1 लाख+ सब्सक्राइबर बेस तक सीधी पहुँच।</p>
          </div>
        </div>
      </div>

      <div className="text-center bg-gray-900 text-white rounded-3xl p-8 space-y-4">
        <h3 className="text-2xl font-bold font-display">मीडिया किट और रेट कार्ड के लिए संपर्क करें</h3>
        <p className="text-sm text-gray-300">ईमेल: <a href="mailto:khabarcutnews@gmail.com" className="font-bold underline text-red-400">khabarcutnews@gmail.com</a> | फोन: +91 94311 00000</p>
        <Link href="/contact" className="inline-flex items-center gap-2 bg-[#D90429] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
          <Mail className="w-4 h-4" />
          विज्ञापन टीम से बात करें
        </Link>
      </div>
    </div>
  );
}
