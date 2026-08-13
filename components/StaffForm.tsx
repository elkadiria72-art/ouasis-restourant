'use client';

import { useState } from 'react';
import { Plus, UserRound } from 'lucide-react';
import type { StaffRole, StaffStatus } from '@/lib/staff-actions';
import { ar } from '@/lib/ar';

interface StaffFormProps {
  onSubmit: (payload: {
    name: string;
    role: StaffRole;
    status: StaffStatus;
    email?: string;
  }) => Promise<void> | void;
  submitting: boolean;
}

const roleOptions: StaffRole[] = ['Waiter', 'Kitchen', 'Staff'];

export default function StaffForm({ onSubmit, submitting }: StaffFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Waiter');
  const [status, setStatus] = useState<StaffStatus>('online');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('اسم الموظف مطلوب.');
      return;
    }

    setError('');
    await onSubmit({ name: name.trim(), role, status, email: email.trim() || undefined });

    setName('');
    setRole('Waiter');
    setStatus('online');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-right">
      <div className="mb-5 flex items-center justify-end gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">إضافة موظف</h3>
          <p className="text-sm text-slate-400">إنشاء حساب جديد للفريق</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600/20 text-amber-500">
          <UserRound size={18} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">الاسم الكامل</span>
          <input
            dir="rtl"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-amber-600"
            placeholder="سعيد منير"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">البريد الإلكتروني</span>
          <input
            dir="ltr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-amber-600"
            type="email"
            placeholder="staff@elkahmed.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">الدور</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as StaffRole)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {ar.staffRole[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">الحالة الأولية</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StaffStatus)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-amber-600"
          >
            <option value="online">{ar.staffStatus.online}</option>
            <option value="offline">{ar.staffStatus.offline}</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex justify-start">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-3 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          {submitting ? 'جاري الحفظ...' : 'إضافة موظف'}
        </button>
      </div>
    </form>
  );
}
