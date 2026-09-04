-- Migration: 020_create_invoices_storage_bucket.sql
-- Description: Create dedicated Supabase Storage bucket for developer invoices with RLS policies

-- 1. Insert bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  true,
  20971520, -- 20 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/jpg'];

-- 2. Storage Objects RLS Policies for 'invoices' bucket

-- Public Read Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read invoices'
  ) THEN
    CREATE POLICY "Public read invoices"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'invoices');
  END IF;
END $$;

-- Upload Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow upload invoices'
  ) THEN
    CREATE POLICY "Allow upload invoices"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'invoices');
  END IF;
END $$;

-- Update Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow update invoices'
  ) THEN
    CREATE POLICY "Allow update invoices"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'invoices');
  END IF;
END $$;

-- Delete Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow delete invoices'
  ) THEN
    CREATE POLICY "Allow delete invoices"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'invoices');
  END IF;
END $$;
