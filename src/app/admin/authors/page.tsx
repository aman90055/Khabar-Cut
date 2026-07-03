'use client';

import * as React from 'react';
import { Search, Users, Loader2, Mail, FileText, Shield, UserCheck } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
  role: { name: string; slug: string } | null;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'super-admin': { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', icon: '👑' },
  'admin': { bg: 'bg-orange-100 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', icon: '⚙️' },
  'editor-in-chief': { bg: 'bg-purple-100 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', icon: '📝' },
  'news-editor': { bg: 'bg-blue-100 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', icon: '✏️' },
  'senior-reporter': { bg: 'bg-indigo-100 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', icon: '🎙️' },
  'reporter': { bg: 'bg-cyan-100 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', icon: '📰' },
  'columnist': { bg: 'bg-teal-100 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-400', icon: '🖊️' },
  'contributor': { bg: 'bg-green-100 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', icon: '✍️' },
  'reader': { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400', icon: '👤' },
};

function getRoleStyle(slug: string | undefined) {
  return ROLE_COLORS[slug || 'reader'] || ROLE_COLORS.reader;
}

const AVATAR_COLORS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdminAuthorsPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (roleFilter !== 'all') params.set('role', roleFilter);

    fetch(`/api/users?${params}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.data ?? []);
        setTotal(data.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, roleFilter]);

  const staffRoles = ['super-admin', 'admin', 'editor-in-chief', 'news-editor', 'senior-reporter', 'reporter', 'columnist', 'contributor'];
  const staffUsers = users.filter(u => staffRoles.includes(u.role?.slug || ''));
  const readerUsers = users.filter(u => !staffRoles.includes(u.role?.slug || ''));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Team & Authors</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} members registered</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D90429]/30 focus:border-[#D90429] transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {[
            { label: 'All', value: 'all' },
            { label: 'Staff', value: 'reporter' },
            { label: 'Readers', value: 'reader' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === tab.value
                  ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#D90429]" />
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Users className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No members found</p>
        </div>
      )}

      {/* Staff Cards */}
      {!loading && staffUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#D90429]" />
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Editorial Team</h2>
            <span className="text-xs text-zinc-400">({staffUsers.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {staffUsers.map(user => {
              const roleStyle = getRoleStyle(user.role?.slug);
              const avatarGrad = getAvatarColor(user.id);
              return (
                <div
                  key={user.id}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="h-14 w-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-lg font-black shrink-0 shadow-md`}>
                        {getInitials(user.full_name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{user.full_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                          {roleStyle.icon} {user.role?.name || 'Reader'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <UserCheck className="h-3 w-3" />
                      <span>{user.status === 'ACTIVE' ? 'Active' : user.status}</span>
                    </div>
                    <a
                      href={`/admin/articles?author=${user.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline"
                    >
                      <FileText className="h-3 w-3" /> View Articles
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reader Users */}
      {!loading && readerUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Registered Readers</h2>
            <span className="text-xs text-zinc-400">({readerUsers.length})</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {readerUsers.slice(0, 20).map(user => {
                const avatarGrad = getAvatarColor(user.id);
                return (
                  <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                    ) : (
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                        {getInitials(user.full_name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{user.full_name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full font-bold uppercase">
                      Reader
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
