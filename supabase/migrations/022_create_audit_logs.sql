-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and insert logs (or anonymous if needed, matching current pattern)
CREATE POLICY "Enable read access for all users" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON audit_logs FOR INSERT WITH CHECK (true);
