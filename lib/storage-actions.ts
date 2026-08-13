'use server';

import { getSupabaseClient } from '@/lib/supabase';

const BUCKET = 'restaurant-assets';

export type AssetUploadType = 'logo' | 'new_order_sound' | 'waiter_call_sound';

const ASSET_RULES: Record<AssetUploadType, { folder: string; maxBytes: number; mimePattern: RegExp }> = {
  logo: { folder: 'logos', maxBytes: 2 * 1024 * 1024, mimePattern: /^image\// },
  new_order_sound: { folder: 'sounds', maxBytes: 5 * 1024 * 1024, mimePattern: /^audio\// },
  waiter_call_sound: { folder: 'sounds', maxBytes: 5 * 1024 * 1024, mimePattern: /^audio\// },
};

export async function uploadRestaurantAsset(formData: FormData): Promise<string> {
  const supabase = getSupabaseClient();
  const file = formData.get('file');
  const type = formData.get('type') as AssetUploadType;

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('يرجى اختيار ملف صالح.');
  }
  if (!type || !ASSET_RULES[type]) {
    throw new Error('نوع الملف غير مدعوم.');
  }

  const rules = ASSET_RULES[type];
  if (!rules.mimePattern.test(file.type)) {
    throw new Error(type === 'logo' ? 'يجب أن يكون الملف صورة.' : 'يجب أن يكون الملف صوتاً.');
  }
  if (file.size > rules.maxBytes) {
    throw new Error('حجم الملف أكبر من المسموح.');
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${rules.folder}/${type}-${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
    cacheControl: '3600',
  });

  if (uploadError) {
    throw new Error(
      `فشل رفع الملف (${BUCKET}): ${uploadError.message}. أنشئ bucket باسم restaurant-assets واجعله عاماً.`
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('تعذر الحصول على رابط الملف العام.');
  }

  return data.publicUrl;
}
