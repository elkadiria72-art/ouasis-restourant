'use client';

import { useEffect, useState } from 'react';
import StaffForm from '@/components/StaffForm';
import StaffTable from '@/components/StaffTable';
import { addStaffMember, fetchStaffMembers, updateStaffRole, updateStaffStatus, type StaffMember } from '@/lib/staff-actions';

export default function StaffPage() {
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
      setError((err as Error).message || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (payload: { name: string; role: StaffMember['role']; status: StaffMember['status']; email?: string }) => {
    try {
      setSubmitting(true);
      setError(null);
      await addStaffMember(payload);
      await loadStaff();
    } catch (err) {
      setError((err as Error).message || 'Failed to add staff member');
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
      setError((err as Error).message || 'Failed to update staff role');
    }
  };

  const handleToggleStatus = async (id: number, status: StaffMember['status']) => {
    try {
      setError(null);
      await updateStaffStatus(id, status);
      await loadStaff();
    } catch (err) {
      setError((err as Error).message || 'Failed to update staff status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Staff Management</h1>
        <p className="mt-1 text-slate-400">Manage team access, roles, and live availability.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <StaffForm onSubmit={handleAddStaff} submitting={submitting} />

      {loading ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center text-slate-400">
          Loading staff members...
        </div>
      ) : (
        <StaffTable staff={staff} onRoleChange={handleRoleChange} onToggleStatus={handleToggleStatus} />
      )}
    </div>
  );
}

