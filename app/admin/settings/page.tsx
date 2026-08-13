'use client';

import { useEffect, useState } from 'react';
import { Save, Store, Palette, Languages } from 'lucide-react';
import { defaultSettings } from '@/lib/settings-types';
import { fetchRestaurantSettings, saveRestaurantSettings, type RestaurantSettings } from '@/lib/settings-actions';
import { ar } from '@/lib/ar';

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRestaurantSettings();
        setSettings({ ...defaultSettings, ...data });
      } catch (err) {
        setError((err as Error).message || 'فشل تحميل الإعدادات');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (field: keyof RestaurantSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await saveRestaurantSettings(settings);
      setSuccess('تم حفظ إعدادات المطعم بنجاح.');
    } catch (err) {
      setError((err as Error).message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
          {ar.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">إعدادات المطعم</h1>
        <p className="mt-1 text-sm text-slate-400">
          اضبط ملف المطعم وإعدادات المنيو الافتراضية وهوية رموز QR.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">{error}</div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-right">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center justify-end gap-3">
            <h2 className="text-xl font-semibold text-white">معلومات المطعم</h2>
            <Store className="text-amber-500" size={20} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">اسم المطعم</span>
              <input
                dir="rtl"
                value={settings.restaurant_name}
                onChange={(event) => handleChange('restaurant_name', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">رابط الشعار</span>
              <input
                dir="ltr"
                value={settings.logo_url}
                onChange={(event) => handleChange('logo_url', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
                placeholder="https://..."
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">الوصف</span>
              <textarea
                dir="rtl"
                value={settings.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="min-h-28 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">الهاتف</span>
              <input
                dir="ltr"
                value={settings.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">العنوان</span>
              <input
                dir="rtl"
                value={settings.address}
                onChange={(event) => handleChange('address', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">ساعات العمل</span>
              <input
                dir="rtl"
                value={settings.working_hours}
                onChange={(event) => handleChange('working_hours', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center justify-end gap-3">
            <h2 className="text-xl font-semibold text-white">إعدادات المنيو</h2>
            <Languages className="text-blue-500" size={20} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">اللغة الافتراضية</span>
              <select
                value={settings.default_language}
                onChange={(event) => handleChange('default_language', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              >
                <option value="Arabic">العربية</option>
                <option value="English">الإنجليزية</option>
                <option value="French">الفرنسية</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">العملة</span>
              <select
                value={settings.currency}
                onChange={(event) => handleChange('currency', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              >
                <option value="MAD">درهم مغربي (MAD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center justify-end gap-3">
            <h2 className="text-xl font-semibold text-white">الهوية البصرية ورموز QR</h2>
            <Palette className="text-violet-500" size={20} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">اللون الأساسي</span>
              <input
                type="color"
                value={settings.primary_color || '#C9A227'}
                onChange={(event) => handleChange('primary_color', event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">اللون الثانوي</span>
              <input
                type="color"
                value={settings.secondary_color || '#F8EED0'}
                onChange={(event) => handleChange('secondary_color', event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">لون التمييز</span>
              <input
                type="color"
                value={settings.accent_color || '#F59E0B'}
                onChange={(event) => handleChange('accent_color', event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">الخط</span>
              <select
                value={settings.font_family}
                onChange={(event) => handleChange('font_family', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Tajawal, sans-serif">Tajawal</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">نص QR مخصص</span>
              <input
                dir="rtl"
                value={settings.qr_text}
                onChange={(event) => handleChange('qr_text', event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
                placeholder="امسح لعرض المنيو"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}
