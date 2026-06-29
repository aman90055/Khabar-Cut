'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Trash2, Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { createState, updateState, deleteState } from '@/features/geography/actions';

interface StateItem {
  id: string;
  name: string;
  code: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    districts: number;
    articles: number;
  };
}

interface StatesManagerProps {
  initialStates: StateItem[];
}

export function StatesManager({ initialStates }: StatesManagerProps) {
  const [states, setStates] = React.useState<StateItem[]>(initialStates);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Edit/create state form
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setSortOrder(0);
    setIsActive(true);
    setIsOpen(true);
  };

  const openEditModal = (st: StateItem) => {
    setEditingId(st.id);
    setName(st.name);
    setCode(st.code);
    setSortOrder(st.sortOrder);
    setIsActive(st.isActive);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      toast.error('State name and code are required');
      return;
    }

    startTransition(async () => {
      try {
        if (editingId) {
          const res = await updateState(editingId, {
            name: name.trim(),
            code: code.trim().toUpperCase(),
            sortOrder,
            isActive,
          });

          if (res.success) {
            toast.success(`State "${res.data.name}" updated successfully`);
            setStates((prev) =>
              prev.map((s) => (s.id === editingId ? { ...s, ...res.data } : s))
            );
            setIsOpen(false);
          }
        } else {
          const res = await createState({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            sortOrder,
            isActive,
          });

          if (res.success) {
            toast.success(`State "${res.data.name}" created successfully`);
            setStates((prev) => [
              ...prev,
              {
                ...res.data,
                _count: { districts: 0, articles: 0 },
              },
            ]);
            setIsOpen(false);
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save State');
      }
    });
  };

  const handleDelete = async (id: string, stateName: string) => {
    if (!confirm(`Are you sure you want to delete "${stateName}"? This will disable regional categorization for its districts.`)) {
      return;
    }

    try {
      const res = await deleteState(id);
      if (res.success) {
        toast.success(`State "${stateName}" deleted successfully`);
        setStates((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete state');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Regional States</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure regional news hubs by setting up active Indian states.</p>
        </div>
        <Button onClick={openNewModal} className="font-semibold gap-2">
          <Plus className="h-4 w-4" />
          Add State
        </Button>
      </div>

      {/* Table grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {states.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <MapPin className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
              <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No States Configured</h3>
              <p className="text-xs text-zinc-500 mt-1">Add state codes to enable regional and district reporting networks.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10">
                  <th className="py-3.5 px-6">State Name</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4 text-center">Districts</th>
                  <th className="py-3.5 px-4 text-center">Articles</th>
                  <th className="py-3.5 px-4 text-center">Sort Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-sm font-semibold">
                {states.map((st) => (
                  <tr key={st.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6 text-zinc-900 dark:text-zinc-50">{st.name}</td>
                    <td className="py-4 px-4 font-mono text-xs">{st.code}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">{st._count.districts}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">{st._count.articles}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">{st.sortOrder}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={st.isActive ? 'success' : 'secondary'}>
                        {st.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(st)} className="h-8 gap-1">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(st.id, st.name)} className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit State' : 'Add State'}</DialogTitle>
            <DialogDescription>Provide geographical metrics for regional page generation.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">State Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">State Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. UP"
                  maxLength={5}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveState"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded"
              />
              <label htmlFor="isActiveState" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Mark State as Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)} className="font-semibold">
                Cancel
              </Button>
              <Button disabled={isPending} type="submit" className="font-semibold gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create State'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
