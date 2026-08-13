'use client';

/** تشغيل إشعار صوتي من رابط مرفوع في Supabase Storage */
export async function playSoundUrl(url?: string | null): Promise<boolean> {
  if (!url?.trim()) return false;

  try {
    const audio = new Audio(url);
    audio.volume = 0.85;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}
