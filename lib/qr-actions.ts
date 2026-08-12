'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export async function fetchQRCodes() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function generateQRCode(tableId: number, tableNumber: number) {
  const supabase = getSupabase();

  // Generate QR code data - this would point to the customer menu page for that table
  const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/menu?table=${tableId}`;

  try {
    // Generate QR code as data URL (PNG)
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 300,
    });

    // Store QR code in database
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

    return qrImageUrl;
  } catch (err) {
    throw new Error((err as Error).message || 'Failed to generate QR code');
  }
}

export async function generateAllQRCodes() {
  const supabase = getSupabase();

  try {
    // Fetch all tables
    const { data: tables, error: fetchError } = await supabase
      .from('tables')
      .select('id, table_number')
      .order('table_number', { ascending: true });

    if (fetchError) throw fetchError;
    if (!tables || tables.length === 0) throw new Error('No tables found');

    // Generate QR codes for all tables
    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/menu?table=${table.id}`;
        const qrImageUrl = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
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

    // Batch insert/upsert all QR codes
    const { error: insertError } = await supabase.from('qr_codes').upsert(qrCodes, {
      onConflict: 'table_id',
    });

    if (insertError) throw insertError;

    revalidatePath('/admin/qr-codes');
    return qrCodes;
  } catch (err) {
    throw new Error((err as Error).message || 'Failed to generate QR codes');
  }
}

export async function deleteQRCode(tableId: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('qr_codes').delete().eq('table_id', tableId);

  revalidatePath('/admin/qr-codes');
  if (error) throw error;
}
