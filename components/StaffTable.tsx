'use client';

import { UserRound, Power, CircleCheckBig, Circle } from 'lucide-react';
import type { StaffMember } from '@/lib/staff-actions';

interface StaffTableProps {
  staff: StaffMember[];
  onRoleChange: (id: number, role: StaffMember['role']) => void;
  onToggleStatus: (id: number, status: StaffMember['status']) => void;
}

const roleOptions: StaffMember['role'][] = ['Waiter', 'Kitchen', 'Staff'];

export default function StaffTable({ staff, onRoleChange, onToggleStatus }: StaffTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900/80 text-left">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-slate-300">Name</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-300">Role</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-300">Status</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-750/60 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600/20 text-amber-500">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      {member.email && <p className="text-xs text-slate-400">{member.email}</p>}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <select
                    value={member.role}
                    onChange={(event) => onRoleChange(member.id, event.target.value as StaffMember['role'])}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-0 focus:border-amber-600"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>

                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                    member.status === 'online'
                      ? 'bg-green-500/15 text-green-300 ring-1 ring-green-400/50'
                      : 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/50'
                  }`}>
                    {member.status === 'online' ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    {member.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    onClick={() => onToggleStatus(member.id, member.status === 'online' ? 'offline' : 'online')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      member.status === 'online'
                        ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25'
                        : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                    }`}
                  >
                    <Power size={14} />
                    {member.status === 'online' ? 'Disable' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
