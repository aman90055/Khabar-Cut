-- ============================================================
-- KHABAR CUT — Seed Data SQL
-- Run this in Supabase SQL Editor AFTER the schema SQL
-- ============================================================

-- ── 1. CATEGORIES (Hindi News Categories) ───────────────────
INSERT INTO public.categories (name, slug, description, sort_order, is_active, seo_title, seo_description)
VALUES
  ('राष्ट्रीय', 'national', 'भारत की प्रमुख राष्ट्रीय खबरें, नीतियां और घटनाएं।', 1, true,
   'राष्ट्रीय समाचार - Khabar Cut', 'भारत की ताज़ा राष्ट्रीय खबरें पढ़ें Khabar Cut पर।'),

  ('झारखंड', 'jharkhand', 'झारखंड राज्य की ताज़ा खबरें, राजनीति, विकास और समाचार।', 2, true,
   'झारखंड समाचार - Khabar Cut', 'झारखंड की सभी ताज़ा खबरें Khabar Cut पर पढ़ें।'),

  ('बिहार', 'bihar', 'बिहार की ताज़ा खबरें, राजनीति और विकास संबंधी समाचार।', 3, true,
   'बिहार समाचार - Khabar Cut', 'बिहार की सभी ताज़ा खबरें Khabar Cut पर।'),

  ('राजनीति', 'politics', 'भारतीय राजनीति, चुनाव, संसद और नेताओं से जुड़ी खबरें।', 4, true,
   'राजनीति समाचार - Khabar Cut', 'ताज़ा राजनीतिक खबरें और विश्लेषण।'),

  ('व्यापार', 'business', 'शेयर बाज़ार, उद्योग, स्टार्टअप और आर्थिक खबरें।', 5, true,
   'व्यापार समाचार - Khabar Cut', 'बिज़नेस और आर्थिक खबरें Khabar Cut पर।'),

  ('खेल', 'sports', 'क्रिकेट, फुटबॉल, हॉकी और अन्य खेलों की ताज़ा खबरें।', 6, true,
   'खेल समाचार - Khabar Cut', 'भारत और विश्व के खेलों की ताज़ा खबरें।'),

  ('मनोरंजन', 'entertainment', 'बॉलीवुड, टीवी, ओटीटी और सेलेब्रिटी न्यूज़।', 7, true,
   'मनोरंजन समाचार - Khabar Cut', 'बॉलीवुड और मनोरंजन की ताज़ा खबरें।'),

  ('तकनीक', 'technology', 'टेक, गैजेट्स, AI और साइबर सुरक्षा की खबरें।', 8, true,
   'टेक्नोलॉजी समाचार - Khabar Cut', 'तकनीक और गैजेट्स की ताज़ा खबरें।'),

  ('अंतरराष्ट्रीय', 'international', 'विश्व की प्रमुख घटनाएं और अंतरराष्ट्रीय समाचार।', 9, true,
   'अंतरराष्ट्रीय समाचार - Khabar Cut', 'दुनिया भर की ताज़ा खबरें।'),

  ('शिक्षा', 'education', 'परीक्षाएं, परिणाम, JSSC, JPSC, शिक्षा नीति समाचार।', 10, true,
   'शिक्षा समाचार - Khabar Cut', 'शिक्षा और परीक्षाओं की ताज़ा खबरें।'),

  ('स्वास्थ्य', 'health', 'स्वास्थ्य, चिकित्सा और जीवनशैली से जुड़ी खबरें।', 11, true,
   'स्वास्थ्य समाचार - Khabar Cut', 'स्वास्थ्य और फिटनेस की ताज़ा खबरें।'),

  ('धर्म-संस्कृति', 'religion', 'धार्मिक समाचार, त्यौहार, संस्कृति और परंपरा।', 12, true,
   'धर्म और संस्कृति - Khabar Cut', 'धार्मिक और सांस्कृतिक खबरें।')

ON CONFLICT (slug) DO NOTHING;


-- ── 2. STATES ───────────────────────────────────────────────
INSERT INTO public.states (name, slug, code, is_active)
VALUES
  ('झारखंड', 'jharkhand', 'JH', true),
  ('बिहार', 'bihar', 'BR', true),
  ('उत्तर प्रदेश', 'uttar-pradesh', 'UP', true),
  ('दिल्ली', 'delhi', 'DL', true),
  ('पश्चिम बंगाल', 'west-bengal', 'WB', true),
  ('ओडिशा', 'odisha', 'OD', true),
  ('छत्तीसगढ़', 'chhattisgarh', 'CG', true),
  ('मध्य प्रदेश', 'madhya-pradesh', 'MP', true),
  ('महाराष्ट्र', 'maharashtra', 'MH', true),
  ('राजस्थान', 'rajasthan', 'RJ', true)
ON CONFLICT (slug) DO NOTHING;


-- ── 3. JHARKHAND DISTRICTS ───────────────────────────────────
DO $$
DECLARE
  jh_id UUID;
BEGIN
  SELECT id INTO jh_id FROM public.states WHERE slug = 'jharkhand';
  IF jh_id IS NOT NULL THEN
    INSERT INTO public.districts (state_id, name, slug, is_active) VALUES
      (jh_id, 'रांची', 'ranchi', true),
      (jh_id, 'धनबाद', 'dhanbad', true),
      (jh_id, 'जमशेदपुर', 'jamshedpur', true),
      (jh_id, 'बोकारो', 'bokaro', true),
      (jh_id, 'हजारीबाग', 'hazaribagh', true),
      (jh_id, 'देवघर', 'deoghar', true),
      (jh_id, 'गिरिडीह', 'giridih', true),
      (jh_id, 'दुमका', 'dumka', true),
      (jh_id, 'पलामू', 'palamu', true),
      (jh_id, 'गुमला', 'gumla', true),
      (jh_id, 'साहिबगंज', 'sahibganj', true),
      (jh_id, 'चाईबासा', 'chaibasa', true)
    ON CONFLICT (state_id, slug) DO NOTHING;
  END IF;
END $$;


-- ── 4. TAGS ───────────────────────────────────────────────────
INSERT INTO public.tags (name, slug) VALUES
  ('Breaking News', 'breaking-news'),
  ('स्वतंत्रता दिवस', 'independence-day'),
  ('झारखंड', 'jharkhand'),
  ('बिहार', 'bihar'),
  ('रांची', 'ranchi'),
  ('PM Modi', 'pm-modi'),
  ('JSSC CGL', 'jssc-cgl'),
  ('JPSC', 'jpsc'),
  ('चुनाव', 'election'),
  ('शेयर बाज़ार', 'share-market'),
  ('AI', 'artificial-intelligence'),
  ('क्रिकेट', 'cricket'),
  ('बॉलीवुड', 'bollywood'),
  ('मौसम', 'weather'),
  ('राजनीति', 'politics')
ON CONFLICT (slug) DO NOTHING;


-- ── 5. DEFAULT AUTHOR (Editorial Team) ───────────────────────
-- Note: This creates an author without a linked profile (profile_id = null)
-- Link to a real Supabase Auth user after login
INSERT INTO public.authors (display_name, designation, bio, is_verified)
VALUES
  ('खबर कट न्यूज़रूम', 'Chief Reporter', 'खबर कट की संपादकीय टीम — झारखंड, बिहार और राष्ट्रीय समाचारों की ताज़ा रिपोर्ट।', true),
  ('अमित कुमार', 'Senior Reporter', 'राजनीति और झारखंड समाचारों के विशेषज्ञ पत्रकार।', true),
  ('प्रिया शर्मा', 'Tech Reporter', 'तकनीक, AI और डिजिटल मीडिया की विशेषज्ञ।', true),
  ('राजेश मेहता', 'Business Reporter', 'बिज़नेस और आर्थिक मामलों के रिपोर्टर।', true),
  ('संजय राज', 'National Reporter', 'राष्ट्रीय राजनीति और सरकारी नीतियों के जानकार।', true)
ON CONFLICT DO NOTHING;


-- ── 6. AD SLOTS (Already seeded by schema, but ensure exists) ─
INSERT INTO public.ad_slots (name, location, device) VALUES
  ('header_top', 'header', 'all'),
  ('homepage_top', 'homepage', 'all'),
  ('homepage_middle', 'homepage', 'all'),
  ('article_top', 'article', 'all'),
  ('article_middle', 'article', 'all'),
  ('article_bottom', 'article', 'all'),
  ('sidebar', 'sidebar', 'desktop'),
  ('footer', 'footer', 'all'),
  ('mobile_sticky', 'mobile', 'mobile')
ON CONFLICT (name) DO NOTHING;


-- ── VERIFY ───────────────────────────────────────────────────
SELECT 'categories' as table_name, count(*) as rows FROM public.categories
UNION ALL
SELECT 'states', count(*) FROM public.states
UNION ALL
SELECT 'districts', count(*) FROM public.districts
UNION ALL
SELECT 'tags', count(*) FROM public.tags
UNION ALL
SELECT 'authors', count(*) FROM public.authors
UNION ALL
SELECT 'ad_slots', count(*) FROM public.ad_slots;
