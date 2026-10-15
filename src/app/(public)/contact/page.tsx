'use client';

import * as React from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit message');
      }

      setSubmitted(true);
      toast.success('आपका संदेश khabarcutnews@gmail.com पर सीधे भेज दिया गया है!');
    } catch {
      toast.error('संदेश भेजने में विफलता। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 xl:px-10 py-10 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="kc-badge bg-[#0057FF] text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
          संपर्क करें (Contact Newsroom)
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight">
          Khabar Cut सम्पादकीय व प्रशासनिक टीम से जुड़ें
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          क्या आपके पास कोई समाचार, प्रेस विज्ञप्ति, शिकायत या विज्ञापन संबंधी प्रश्न है? हमसे बेझिझक संपर्क करें।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-[#D90429] pl-3">
              न्यूज़रूम & पब्लिकेशन ऑफिस
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D90429] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">प्रधान कार्यालय:</strong>
                  Khabar Cut Media Network, अशोक नगर, मेन रोड, रांची, झारखंड - 834002
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0057FF] shrink-0" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">ऑफिशियल व सम्पादकीय ईमेल:</strong>
                  <a href="mailto:khabarcutnews@gmail.com" className="text-[#D90429] font-bold hover:underline">
                    khabarcutnews@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">न्यूज़रूम हेल्पलाइन:</strong>
                  +91 94311 00000 / 0651-2400000
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">कार्य समय:</strong>
                  24x7 डिजिटल न्यूज़रूम डेस्क
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">विज्ञापन व व्यावसायिक पूछताछ</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ब्रांड प्रमोशन, बैनर विज्ञापन और मीडिया पार्टनरशिप के लिए ईमेल: <a href="mailto:khabarcutnews@gmail.com" className="font-bold text-[#D90429] hover:underline">khabarcutnews@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">संदेश भेजें (Send Inquiry)</h2>
          
          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">संदेश सफलतापूर्वक प्राप्त हुआ!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                आपका संदेश <strong>khabarcutnews@gmail.com</strong> पर भेज दिया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-[#D90429] underline"
              >
                एक और संदेश भेजें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="अपना पूरा नाम लिखें"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D90429]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">ईमेल पता *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D90429]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">विषय (Subject) *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="समाचार / शिकायत / सुझाव / विज्ञापन"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D90429]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">आपका संदेश (Message) *</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="अपना संदेश विस्तार से लिखें..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D90429]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#D90429] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'भेजा जा रहा है...' : 'संदेश भेजें'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
