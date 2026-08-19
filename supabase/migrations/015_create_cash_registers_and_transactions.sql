-- Migration 015: Create cash_registers and cash_transactions tables in Supabase
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id TEXT PRIMARY KEY,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opened_by TEXT NOT NULL,
    closed_by TEXT,
    initial_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_balance NUMERIC(10,2),
    expected_balance NUMERIC(10,2),
    difference NUMERIC(10,2),
    cash_physical_count NUMERIC(10,2),
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read cash_registers" ON public.cash_registers;
DROP POLICY IF EXISTS "Allow public insert cash_registers" ON public.cash_registers;
DROP POLICY IF EXISTS "Allow public update cash_registers" ON public.cash_registers;

CREATE POLICY "Allow public read cash_registers" ON public.cash_registers FOR SELECT USING (true);
CREATE POLICY "Allow public insert cash_registers" ON public.cash_registers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cash_registers" ON public.cash_registers FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id TEXT PRIMARY KEY,
    register_id TEXT NOT NULL,
    order_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'efectivo',
    description TEXT DEFAULT '',
    registered_by TEXT DEFAULT '',
    role TEXT DEFAULT '',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read cash_transactions" ON public.cash_transactions;
DROP POLICY IF EXISTS "Allow public insert cash_transactions" ON public.cash_transactions;
DROP POLICY IF EXISTS "Allow public update cash_transactions" ON public.cash_transactions;

CREATE POLICY "Allow public read cash_transactions" ON public.cash_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert cash_transactions" ON public.cash_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cash_transactions" ON public.cash_transactions FOR UPDATE USING (true);
