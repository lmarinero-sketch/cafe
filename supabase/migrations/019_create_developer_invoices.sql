-- Migration 019: Create developer_invoices table in Supabase
CREATE TABLE IF NOT EXISTS public.developer_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'abono_mensual',
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    file_url TEXT,
    file_name TEXT,
    file_type TEXT DEFAULT 'pdf',
    notes TEXT,
    paid_at TIMESTAMPTZ,
    uploaded_by TEXT DEFAULT 'lmarinero',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS configuration
ALTER TABLE public.developer_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read developer_invoices" ON public.developer_invoices;
CREATE POLICY "Allow read developer_invoices" ON public.developer_invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all developer_invoices for authenticated" ON public.developer_invoices;
CREATE POLICY "Allow all developer_invoices for authenticated" ON public.developer_invoices FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.developer_invoices;
  EXCEPTION WHEN duplicate_object THEN END;
END $$;
