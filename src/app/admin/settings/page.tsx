'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Globe, Settings, Eye, Mail, Key, Sparkles, Layout } from 'lucide-react';
import { toast } from 'sonner';

type ActiveTab = 'general' | 'seo' | 'ads' | 'smtp' | 'api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('general');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // General Settings
  const [siteName, setSiteName] = React.useState('Khabar Cut');
  const [siteDescription, setSiteDescription] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');

  // SEO Settings
  const [googleVerification, setGoogleVerification] = React.useState('');
  const [robotsMeta, setRobotsMeta] = React.useState('index, follow');

  // Ad settings
  const [adsenseId, setAdsenseId] = React.useState('');
  const [adsterraId, setAdsterraId] = React.useState('');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = React.useState('');
  const [smtpPort, setSmtpPort] = React.useState('');
  const [smtpUser, setSmtpUser] = React.useState('');

  // API Keys
  const [geminiApiKey, setGeminiApiKey] = React.useState('');

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        data.forEach((setting: any) => {
          if (setting.key === 'site_name') setSiteName(setting.value);
          if (setting.key === 'site_description') setSiteDescription(setting.value);
          if (setting.key === 'contact_email') setContactEmail(setting.value);
          if (setting.key === 'google_verification') setGoogleVerification(setting.value);
          if (setting.key === 'robots_meta') setRobotsMeta(setting.value);
          if (setting.key === 'adsense_id') setAdsenseId(setting.value);
          if (setting.key === 'adsterra_id') setAdsterraId(setting.value);
          if (setting.key === 'smtp_host') setSmtpHost(setting.value);
          if (setting.key === 'smtp_port') setSmtpPort(setting.value);
          if (setting.key === 'smtp_user') setSmtpUser(setting.value);
          if (setting.key === 'gemini_api_key') setGeminiApiKey(setting.value);
        });
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      site_name: { value: siteName, group: 'general' },
      site_description: { value: siteDescription, group: 'general' },
      contact_email: { value: contactEmail, group: 'general' },
      google_verification: { value: googleVerification, group: 'seo' },
      robots_meta: { value: robotsMeta, group: 'seo' },
      adsense_id: { value: adsenseId, group: 'ads' },
      adsterra_id: { value: adsterraId, group: 'ads' },
      smtp_host: { value: smtpHost, group: 'smtp' },
      smtp_port: { value: smtpPort, group: 'smtp' },
      smtp_user: { value: smtpUser, group: 'smtp' },
      gemini_api_key: { value: geminiApiKey, group: 'api' },
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold">Loading settings panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Configure site details, metadata, third-party APIs, and mail delivery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left tabs menu */}
        <div className="space-y-1 bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {[
            { id: 'general', label: 'General Settings', icon: Settings },
            { id: 'seo', label: 'SEO & Indexing', icon: Globe },
            { id: 'ads', label: 'Ad Managers', icon: Layout },
            { id: 'smtp', label: 'SMTP Email', icon: Mail },
            { id: 'api', label: 'API Keys', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right form panel */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold capitalize">{activeTab} Settings</CardTitle>
                <CardDescription>Configure variables for the {activeTab} integration module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {activeTab === 'general' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Website Name</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Website Description</label>
                      <textarea
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        rows={3}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Support/Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'seo' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Google Search Console Verification Tag</label>
                      <input
                        type="text"
                        value={googleVerification}
                        onChange={(e) => setGoogleVerification(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Default Robots Directives</label>
                      <select
                        value={robotsMeta}
                        onChange={(e) => setRobotsMeta(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      >
                        <option value="index, follow">Index, Follow (Standard SEO)</option>
                        <option value="noindex, nofollow">Noindex, Nofollow (Private)</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'ads' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Google AdSense Publisher ID (ca-pub-*)</label>
                      <input
                        type="text"
                        value={adsenseId}
                        onChange={(e) => setAdsenseId(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Adsterra Publisher Key</label>
                      <input
                        type="text"
                        value={adsterraId}
                        onChange={(e) => setAdsterraId(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'smtp' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">SMTP Server Host</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          placeholder="smtp.gmail.com"
                          className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Port</label>
                        <input
                          type="text"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          placeholder="587"
                          className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">SMTP Authenticated User</label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'api' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        Gemini API Key
                        <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-1 py-0.5 rounded-sm">
                          <Sparkles className="h-2.5 w-2.5" /> AI Engine
                        </span>
                      </label>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Submit button */}
                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button disabled={isSaving} type="submit" className="font-bold gap-2">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
