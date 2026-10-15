'use client';

import * as React from 'react';
import { Shield, Search, UserCheck, UserX, Loader2, CreditCard, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PressIdCardModal } from '@/components/admin/press-id-card';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  role: { id: string; name: string; slug: string } | null;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  level: number;
}

export default function UsersAdminPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [selectedUserForCard, setSelectedUserForCard] = React.useState<User | null>(null);

  const fetchUsersAndRoles = React.useCallback(async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/admin/roles'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || usersData || []);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.data || []);
      }
    } catch {
      toast.error('Failed to load users and roles');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId: newRoleId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update role');
      }

      toast.success('🎉 Position & Role updated successfully!');
      
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const matchedRole = roles.find(r => r.id === newRoleId);
          return { ...u, role: matchedRole || u.role };
        }
        return u;
      }));
    } catch (err: any) {
      toast.error(err.message || 'Could not update user position');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#D90429]" /> Super Admin User & Team Management
          </h1>
          <p className="text-sm text-zinc-500">
            Assign positions (Editor-in-Chief, Reporter, etc.) and generate Official Press ID Cards with Aman Vishwakarma's Signature.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429] w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#D90429]" /> Loading team members...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No team members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-4">User / Journalist</th>
                  <th className="px-5 py-4">Current Position / Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions & ID Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredUsers.map(user => {
                  const currentRoleId = user.role?.id || '';
                  const isUpdating = updatingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#D90429]/10 text-[#D90429] font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#D90429]/20">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-zinc-400 text-[11px]">{user.email}</p>
                        </div>
                      </td>

                      {/* Position / Role Change Dropdown */}
                      <td className="px-5 py-3.5">
                        <div className="relative inline-block w-52">
                          <select
                            value={currentRoleId}
                            disabled={isUpdating}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            className="w-full text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429] cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>Select Position...</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D90429] absolute right-3 top-2.5 pointer-events-none" />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions: Generate Press Card */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedUserForCard(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-[#D90429] dark:hover:bg-[#D90429] text-white dark:text-zinc-900 dark:hover:text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Generate Press ID
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Press ID Card Modal */}
      {selectedUserForCard && (
        <PressIdCardModal
          user={selectedUserForCard}
          onClose={() => setSelectedUserForCard(null)}
        />
      )}
    </div>
  );
}
