-- ========================================================
-- OSLO ELITE HOTEL - COMPLETE DATABASE & STORAGE SETUP
-- ========================================================

-- 1. Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_per_night NUMERIC NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  bed_type TEXT DEFAULT 'King Bed',
  size_sqft INTEGER DEFAULT 450,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_nights INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'pay_on_arrival',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GRANT TABLE PERMISSIONS
GRANT ALL ON TABLE public.rooms TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop older policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Allow public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow admin modify rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all on rooms" ON public.rooms;

DROP POLICY IF EXISTS "Allow public read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;

-- Create Open Policies for Rooms (Website browsing & Admin additions)
CREATE POLICY "Allow all on rooms" ON public.rooms
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create Open Policies for Bookings (Guest reservations & Admin management)
CREATE POLICY "Allow all on bookings" ON public.bookings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. SETUP STORAGE BUCKET FOR ROOM IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop older storage policies if any
DROP POLICY IF EXISTS "Public Access Room Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Room Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Room Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Room Images" ON storage.objects;

-- Create Storage Policies
CREATE POLICY "Public Access Room Images" ON storage.objects 
  FOR SELECT TO anon, authenticated 
  USING (bucket_id = 'room-images');

CREATE POLICY "Public Upload Room Images" ON storage.objects 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (bucket_id = 'room-images');

CREATE POLICY "Public Update Room Images" ON storage.objects 
  FOR UPDATE TO anon, authenticated 
  USING (bucket_id = 'room-images');

CREATE POLICY "Public Delete Room Images" ON storage.objects 
  FOR DELETE TO anon, authenticated 
  USING (bucket_id = 'room-images');

-- 7. INSERT INITIAL LUXURY SUITES (Sample Data)
INSERT INTO public.rooms (title, slug, description, price_per_night, capacity, bed_type, size_sqft, amenities, image_url, images)
VALUES 
(
  'The Royal Oslo Penthouse',
  'royal-oslo-penthouse',
  'Perched at the highest vantage point of the hotel, the Royal Oslo Penthouse offers panoramic fjord and skyline views with bespoke Nordic furnishings and a private heated rooftop terrace.',
  1250,
  4,
  'King Bed',
  1200,
  ARRAY['total_rooms:3', 'Fjord View', 'Private Terrace', 'Jacuzzi', 'Butler Service', 'Complimentary Champagne'],
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop']
),
(
  'Grand Nordic Deluxe Suite',
  'grand-nordic-deluxe-suite',
  'Spacious and elegantly finished in natural stone and white oak. Features a dedicated lounge area, opulent rain shower, and floor-to-ceiling soundproof windows.',
  680,
  2,
  'King Bed',
  650,
  ARRAY['total_rooms:5', 'City View', 'Rain Shower', 'Espresso Bar', 'High-speed Wi-Fi', '24/7 Room Service'],
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop']
),
(
  'Executive Fjord Haven',
  'executive-fjord-haven',
  'An intimate sanctuary crafted for executive travelers and couples seeking discreet luxury, ambient lighting, and bespoke wellness amenities.',
  420,
  2,
  'Queen Bed',
  480,
  ARRAY['total_rooms:8', 'Fjord Horizon', 'Marble Bath', 'Smart Room Control', 'Breakfast Included'],
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop']
)
ON CONFLICT (slug) DO NOTHING;

-- 8. CREATE LIVE CONCIERGE CHAT TABLES
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_session_id TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT DEFAULT 'open',
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_admin_count INTEGER DEFAULT 0,
  unread_guest_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('guest', 'admin')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON public.chat_conversations(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg ON public.chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON public.chat_messages(conversation_id);

-- Permissions
GRANT ALL ON TABLE public.chat_conversations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chat_messages TO anon, authenticated, service_role;

-- Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on chat_conversations" ON public.chat_conversations;
CREATE POLICY "Allow all on chat_conversations" ON public.chat_conversations
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow all on chat_messages" ON public.chat_messages
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 9. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
