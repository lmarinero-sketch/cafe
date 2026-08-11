import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const uploadImage = async (bucket: 'product-images' | 'website-images', file: File): Promise<string | null> => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, cannot upload image');
    return null;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image: ', uploadError);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  
  return data.publicUrl;
};
