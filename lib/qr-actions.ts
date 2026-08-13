'use server';

import { revalidatePath } from 'next/cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function formatError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return fallback;
}

function getSupabase(): SupabaseClient {
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    throw new Error('متغيرات Supabase غير مهيأة. تحقق من NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

function generateQrToken(tableId: number, tableNumber: number): string {
  return crypto
    .createHash('md5')
    .update(`elkahmed-${tableId}-${tableNumber}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`)
    .digest('hex')
    .substring(0, 16);
}

async function ensureQrToken(
  supabase: SupabaseClient,
  table: { id: number; table_number: number; qr_token?: string | null }
): Promise<string> {
  if (table.qr_token?.trim()) return table.qr_token.trim();

  const token = generateQrToken(table.id, table.table_number);
  const { error } = await supabase.from('tables').update({ qr_token: token }).eq('id', table.id);

  if (error) {
    // عمود qr_token قد يكون غير موجود — نستخدم الرمز محلياً دون إيقاف التوليد
    if (/qr_token|column/i.test(error.message)) return token;
    throw new Error(`تعذر حفظ رمز الطاولة: ${error.message}`);
  }

  return token;
}

function buildMenuUrl(token: string, tableNumber: number): string {
  const base = getAppBaseUrl();
  return `${base}/menu?token=${encodeURIComponent(token)}&table=${tableNumber}`;
}

async function renderQrDataUrl(qrData: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });
  } catch (err) {
    throw new Error(`فشل توليد صورة QR: ${formatError(err, 'خطأ غير معروف')}`);
  }
}

async function upsertQrRecord(
  supabase: SupabaseClient,
  record: {
    table_id: number;
    table_number: number;
    qr_data: string;
    qr_image: string;
  }
) {
  const { error } = await supabase.from('qr_codes').upsert(
    { ...record, generated_at: new Date().toISOString() },
    { onConflict: 'table_id' }
  );

  if (error) {
    throw new Error(`تعذر حفظ رمز QR في قاعدة البيانات: ${error.message}`);
  }
}

export async function fetchQRCodes() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('table_number', { ascending: true });

  if (error) throw new Error(formatError(error, 'فشل جلب رموز QR'));
  return data || [];
}

export async function fetchTablesCount(): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase.from('tables').select('*', { count: 'exact', head: true });
  if (error) throw new Error(formatError(error, 'فشل عد الطاولات'));
  return count || 0;
}

export async function generateQRCode(tableId: number, tableNumber: number) {
  if (!tableId || !tableNumber) {
    throw new Error('معرّف الطاولة ورقمها مطلوبان.');
  }

  const supabase = getSupabase();

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id, table_number, qr_token')
    .eq('id', tableId)
    .maybeSingle();

  if (tableError) {
    throw new Error(`تعذر قراءة الطاولة: ${tableError.message}`);
  }
  if (!table) {
    throw new Error(`الطاولة رقم ${tableNumber} غير موجودة في قاعدة البيانات.`);
  }

  try {
    const token = await ensureQrToken(supabase, table);
    const qrData = buildMenuUrl(token, table.table_number);
    const qrImageUrl = await renderQrDataUrl(qrData);

    await upsertQrRecord(supabase, {
      table_id: tableId,
      table_number: tableNumber,
      qr_data: qrData,
      qr_image: qrImageUrl,
    });

    revalidatePath('/admin/qr');
    revalidatePath('/admin/qr-codes');
    return qrImageUrl;
  } catch (err) {
    throw new Error(formatError(err, 'فشل إنشاء رمز QR'));
  }
}

export async function generateAllQRCodes() {
  const supabase = getSupabase();

  const { data: tables, error: fetchError } = await supabase
    .from('tables')
    .select('id, table_number, qr_token')
    .order('table_number', { ascending: true });

  if (fetchError) {
    throw new Error(`تعذر جلب الطاولات: ${fetchError.message}`);
  }
  if (!tables?.length) {
    throw new Error('لا توجد طاولات في قاعدة البيانات.');
  }

  const qrCodes = [];
  const failures: string[] = [];

  for (const table of tables) {
    try {
      const token = await ensureQrToken(supabase, table);
      const qrData = buildMenuUrl(token, table.table_number);
      const qrImageUrl = await renderQrDataUrl(qrData);

      await upsertQrRecord(supabase, {
        table_id: table.id,
        table_number: table.table_number,
        qr_data: qrData,
        qr_image: qrImageUrl,
      });

      qrCodes.push({
        table_id: table.id,
        table_number: table.table_number,
        qr_data: qrData,
        qr_image: qrImageUrl,
      });
    } catch (err) {
      failures.push(`طاولة ${table.table_number}: ${formatError(err, 'فشل')}`);
    }
  }

  if (!qrCodes.length) {
    throw new Error(failures[0] || 'فشل إنشاء جميع رموز QR');
  }

  revalidatePath('/admin/qr');
  revalidatePath('/admin/qr-codes');

  if (failures.length) {
    throw new Error(`تم إنشاء ${qrCodes.length} رمز. أخطاء: ${failures.slice(0, 3).join(' | ')}`);
  }

  return qrCodes;
}

export async function deleteQRCode(tableId: number) {
  if (!tableId) throw new Error('معرّف الطاولة مطلوب.');

  const supabase = getSupabase();
  const { error } = await supabase.from('qr_codes').delete().eq('table_id', tableId);

  if (error) throw new Error(formatError(error, 'فشل حذف رمز QR'));

  revalidatePath('/admin/qr');
  revalidatePath('/admin/qr-codes');
}
