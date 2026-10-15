import * as React from 'react';
import { ShieldAlert, Mail, MapPin, Phone } from 'lucide-react';

export const metadata = {
  title: 'Grievance Redressal | Khabar Cut News',
  description: 'Grievance Redressal Mechanism under Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021.',
};

export default function GrievancePage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-gray-200 dark:border-white/10 pb-6 space-y-2">
        <span className="kc-badge bg-[#D90429] text-white border-none font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5">
          IT Rules 2021 Compliance
        </span>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">शिकायत निवारण अधिकारी (Grievance Redressal)</h1>
        <p className="text-xs text-gray-500">सूचना प्रौद्योगिकी (मध्यवर्ती दिशा-निर्देश और डिजिटल मीडिया आचार संहिता) नियम 2021 के तहत</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <p>
          सूचना प्रौद्योगिकी नियम 2021 (IT Rules 2021) के अनुपालन में, Khabar Cut पर प्रकाशित किसी भी समाचार, फोटो या सामग्री से संबंधित शिकायत दर्ज करने के लिए हमारे ग्रीवांस ऑफिसर का विवरण निम्नलिखित है:
        </p>

        <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4 not-prose">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-l-4 border-[#D90429] pl-3">
            <ShieldAlert className="w-5 h-5 text-[#D90429]" />
            शिकायत अधिकारी (Grievance Officer)
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>नाम:</strong> श्री विकास महतो (Vikas Mahto)</p>
            <p><strong>पद:</strong> ग्रीवांस Redressal अधिकारी, Khabar Cut Media Network</p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0057FF]" />
              <strong>ईमेल:</strong> <a href="mailto:khabarcutnews@gmail.com" className="font-bold text-[#D90429] underline">khabarcutnews@gmail.com</a>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
              <strong>पता:</strong> Khabar Cut Media Network, अशोक नगर, मेन रोड, रांची, झारखंड - 834002
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">शिकायत दर्ज करने की प्रक्रिया</h2>
        <p>
          अपनी शिकायत में निम्नलिखित विवरण अवश्य शामिल करें:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>संबंधित खबर/आर्टिकल का शीर्षक और यूआरएल (URL)।</li>
          <li>आपकी आपत्ति या शिकायत का सटीक विवरण।</li>
          <li>आपका पूरा नाम, संपर्क नंबर और ईमेल पता।</li>
        </ul>
        <p>
          ग्रीवांस ऑफिसर आपकी शिकायत प्राप्ति के <strong>24 घंटे</strong> के भीतर पावती (Acknowledgment) भेजेंगे और नियमों के तहत <strong>15 दिनों</strong> के भीतर शिकायत का निस्तारण करेंगे।
        </p>
      </div>
    </div>
  );
}
