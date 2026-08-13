'use client';

import { useEffect, useState, useMemo } from 'react';
import StaffForm from '@/components/StaffForm';
import StaffTable from '@/components/StaffTable';
import {
  addStaffMember,
  fetchStaffMembers,
  updateStaffRole,
  updateStaffStatus,
  type StaffMember,
} from '@/lib/staff-actions';
import { useAdminSearch } from '@/components/AdminSearchContext';
import { matchesSearch } from '@/lib/search-utils';
import { ar } from '@/lib/ar';

export default function StaffPage() {
  const { query } = useAdminSearch();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStaffMembers();
      setStaff(data);
    } catch (err) {
      setError((err as Error).message || 'فشل تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredStaff = useMemo(
    () =>
      staff.filter((member) =>
        matchesSearch(
          query,
          member.name,
          member.email,
          member.role,
          ar.staffRole[member.role]
        )
      ),
    [staff, query]
  );

  const handleAddStaff = async (payload: {
    name: string;
    role: StaffMember['role'];
    status: StaffMember['status'];
    email?: string;
  }) => {
    try {
      setSubmitting(true);
      setError(null);
      await addStaffMember(payload);
      await loadStaff();
    } catch (err) {
      setError((err as Error).message || 'فشل إضافة الموظف');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id: number, role: StaffMember['role']) => {
    try {
      setError(null);
      await updateStaffRole(id, role);
      await loadStaff();
    } catch (err) {
      setError((err as Error).message || 'فشل تحديث دور الموظف');
    }
  };

  const handleToggleStatus = async (id: number, status: StaffMember['status']) => {
    try {
      setError(null);
      await updateStaffStatus(id, status);
      await loadStaff();
    } catch (err) {
      setError((err as Error).message || 'فشل تحديث حالة الموظف');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">إدارة الموظفين</h1>
        <p className="mt-1 text-sm text-slate-400">أدر صلاحيات الفريق والأدوار والتوفر لحظياً.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <StaffForm onSubmit={handleAddStaff} submitting={submitting} />

      {loading ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
          {ar.loading}
        </div>
      ) : (
        <>
          {query && (
            <p className="text-sm text-slate-400">
              {filteredStaff.length} نتيجة للبحث «{query}»
            </p>
          )}
          <StaffTable
            staff={filteredStaff}
            onRoleChange={handleRoleChange}
            onToggleStatus={handleToggleStatus}
          />
        </>
      )}
    </div>
  );
}
