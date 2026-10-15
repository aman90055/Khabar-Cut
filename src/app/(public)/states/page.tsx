import { getAllStates } from '@/lib/db/states';
import Link from 'next/link';
import { SidebarAd } from '@/components/ads/google-ad';
import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'राज्य समाचार | Khabar Cut',
  description: 'सभी राज्यों की ताज़ा खबरें',
};

const FALLBACK_STATES = [
  { id: '1', name: 'झारखंड', slug: 'jharkhand', code: 'JH', is_active: true, created_at: '' },
  { id: '2', name: 'बिहार', slug: 'bihar', code: 'BR', is_active: true, created_at: '' },
  { id: '3', name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', code: 'UP', is_active: true, created_at: '' },
  { id: '4', name: 'दिल्ली', slug: 'delhi', code: 'DL', is_active: true, created_at: '' },
  { id: '5', name: 'महाराष्ट्र', slug: 'maharashtra', code: 'MH', is_active: true, created_at: '' },
  { id: '6', name: 'राजस्थान', slug: 'rajasthan', code: 'RJ', is_active: true, created_at: '' },
  { id: '7', name: 'मध्य प्रदेश', slug: 'madhya-pradesh', code: 'MP', is_active: true, created_at: '' },
  { id: '8', name: 'छत्तीसगढ़', slug: 'chhattisgarh', code: 'CG', is_active: true, created_at: '' },
  { id: '9', name: 'पश्चिम बंगाल', slug: 'west-bengal', code: 'WB', is_active: true, created_at: '' },
  { id: '10', name: 'ओडिशा', slug: 'odisha', code: 'OD', is_active: true, created_at: '' },
];

export default async function StatesPage() {
  const dbStates = await getAllStates();
  const states = dbStates.length > 0 ? dbStates : FALLBACK_STATES;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              राज्य समाचार
            </h1>
            <p className="text-muted-foreground">सभी राज्यों की ताज़ा खबरें और अपडेट्स</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {states.map((state) => (
              <Link
                key={state.id}
                href={`/states/${state.slug}`}
                className="group p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {state.name}
                    </h2>
                    {state.code && (
                      <p className="text-sm text-muted-foreground uppercase">{state.code}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <aside className="lg:w-[300px] xl:w-[336px]">
          <div className="sticky top-24">
            <SidebarAd />
          </div>
        </aside>
      </div>
    </main>
  );
}
