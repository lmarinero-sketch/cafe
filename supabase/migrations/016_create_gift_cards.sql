-- Migration 016: Create gift_cards table in Supabase
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    current_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    purchaser_name TEXT NOT NULL DEFAULT '',
    purchaser_phone TEXT DEFAULT '',
    purchaser_email TEXT DEFAULT '',
    recipient_name TEXT NOT NULL DEFAULT '',
    recipient_phone TEXT DEFAULT '',
    recipient_email TEXT DEFAULT '',
    message TEXT DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'clasica',
    status TEXT NOT NULL DEFAULT 'activa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    usage_history JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all gift_cards" ON public.gift_cards;
CREATE POLICY "Allow public all gift_cards" ON public.gift_cards FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_cards;
  EXCEPTION WHEN duplicate_object THEN END;
END $$;
