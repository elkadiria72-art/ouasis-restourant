'use client';

import { useEffect, useState } from 'react';
import { Save, Store, Palette, Languages, CreditCard } from 'lucide-react';
import { defaultSettings } from '@/lib/settings-types';
import { fetchRestaurantSettings, saveRestaurantSettings, type RestaurantSettings } from '@/lib/settings-actions';

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
        setError((err as Error).message || 'Failed to load settings');
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
      setSuccess('Restaurant settings saved successfully.');
    } catch (err) {
      setError((err as Error).message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Restaurant Settings</h1>
        <p className="mt-1 text-slate-400">Configure your restaurant profile, menu defaults, and QR branding.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">{error}</div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center gap-3">
            <Store className="text-amber-500" size={20} />
            <h2 className="text-xl font-semibold text-white">Restaurant Info</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Restaurant Name</span>
              <input value={settings.restaurant_name} onChange={(event) => handleChange('restaurant_name', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Logo URL</span>
              <input value={settings.logo_url} onChange={(event) => handleChange('logo_url', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" placeholder="https://..." />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Description</span>
              <textarea value={settings.description} onChange={(event) => handleChange('description', event.target.value)} className="min-h-28 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Phone</span>
              <input value={settings.phone} onChange={(event) => handleChange('phone', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Address</span>
              <input value={settings.address} onChange={(event) => handleChange('address', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Working Hours</span>
              <input value={settings.working_hours} onChange={(event) => handleChange('working_hours', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center gap-3">
            <Languages className="text-blue-500" size={20} />
            <h2 className="text-xl font-semibold text-white">Menu Configuration</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Default Language</span>
              <select value={settings.default_language} onChange={(event) => handleChange('default_language', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600">
                <option value="Arabic">Arabic</option>
                <option value="English">English</option>
                <option value="French">French</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Currency</span>
              <select value={settings.currency} onChange={(event) => handleChange('currency', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600">
                <option value="MAD">MAD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="mb-5 flex items-center gap-3">
            <Palette className="text-violet-500" size={20} />
            <h2 className="text-xl font-semibold text-white">Branding & QR Styling</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Primary</span>
              <input type="color" value={settings.primary_color || '#C9A227'} onChange={(event) => handleChange('primary_color', event.target.value)} className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Secondary</span>
              <input type="color" value={settings.secondary_color || '#F8EED0'} onChange={(event) => handleChange('secondary_color', event.target.value)} className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Accent</span>
              <input type="color" value={settings.accent_color || '#F59E0B'} onChange={(event) => handleChange('accent_color', event.target.value)} className="h-12 w-full rounded-lg border border-slate-600 bg-slate-900 p-1" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Typography</span>
              <select value={settings.font_family} onChange={(event) => handleChange('font_family', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600">
                <option value="Inter, sans-serif">Inter</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Tajawal, sans-serif">Tajawal</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Custom QR Text</span>
              <input value={settings.qr_text} onChange={(event) => handleChange('qr_text', event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600" placeholder="Scan to view our menu" />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

