'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('متغيرات Supabase غير مهيأة.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error('يرجى ضبط NEXT_PUBLIC_APP_URL في ملف .env.local (مثال: https://your-domain.com)');
  }
  return url.replace(/\/$/, '');
}

function generateQrToken(tableId: number, tableNumber: number): string {
  return crypto
    .createHash('md5')
    .update(`elkahmed-${tableId}-${tableNumber}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`)
    .digest('hex')
    .substring(0, 16);
}

async function ensureQrToken(
  supabase: ReturnType<typeof getSupabase>,
  table: { id: number; table_number: number; qr_token?: string | null }
): Promise<string> {
  if (table.qr_token) return table.qr_token;

  const token = generateQrToken(table.id, table.table_number);
  const { error } = await supabase.from('tables').update({ qr_token: token }).eq('id', table.id);
  if (error) throw error;
  return token;
}

function buildMenuUrl(token: string): string {
  return `${getAppBaseUrl()}/menu?token=${token}`;
}

export async function fetchQRCodes() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchTablesCount(): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase.from('tables').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function generateQRCode(tableId: number, tableNumber: number) {
  const supabase = getSupabase();

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id, table_number, qr_token')
    .eq('id', tableId)
    .single();

  if (tableError || !table) throw new Error('الطاولة غير موجودة');

  const token = await ensureQrToken(supabase, table);
  const qrData = buildMenuUrl(token);

  try {
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });

    const { error } = await supabase.from('qr_codes').upsert(
      {
        table_id: tableId,
        table_number: tableNumber,
        qr_data: qrData,
        qr_image: qrImageUrl,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'table_id' }
    );

    if (error) throw error;
    revalidatePath('/admin/qr');
    revalidatePath('/admin/qr-codes');
    return qrImageUrl;
  } catch (err) {
    throw new Error((err as Error).message || 'فشل إنشاء رمز QR');
  }
}

export async function generateAllQRCodes() {
  const supabase = getSupabase();

  try {
    const { data: tables, error: fetchError } = await supabase
      .from('tables')
      .select('id, table_number, qr_token')
      .order('table_number', { ascending: true });

    if (fetchError) throw fetchError;
    if (!tables || tables.length === 0) throw new Error('لا توجد طاولات في قاعدة البيانات');

    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        const token = await ensureQrToken(supabase, table);
        const qrData = buildMenuUrl(token);
        const qrImageUrl = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 300,
        });

        return {
          table_id: table.id,
          table_number: table.table_number,
          qr_data: qrData,
          qr_image: qrImageUrl,
          generated_at: new Date().toISOString(),
        };
      })
    );

    const { error: insertError } = await supabase.from('qr_codes').upsert(qrCodes, {
      onConflict: 'table_id',
    });

    if (insertError) throw insertError;

    revalidatePath('/admin/qr');
    revalidatePath('/admin/qr-codes');
    return qrCodes;
  } catch (err) {
    throw new Error((err as Error).message || 'فشل إنشاء رموز QR');
  }
}

export async function deleteQRCode(tableId: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('qr_codes').delete().eq('table_id', tableId);

  revalidatePath('/admin/qr');
  revalidatePath('/admin/qr-codes');
  if (error) throw error;
}
