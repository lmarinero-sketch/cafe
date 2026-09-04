import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

async function setupStoragePolicies() {
  const sql = `
    -- Crear políticas para el bucket de facturas (invoices)
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
  `;

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  console.log('STATUS:', res.status, 'BODY:', body);
}

setupStoragePolicies();
