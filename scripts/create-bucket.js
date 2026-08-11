import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log('Bucket already exists.');
    } else {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }
  } else {
    console.log('Bucket created successfully:', data);
  }
}

createBucket();
