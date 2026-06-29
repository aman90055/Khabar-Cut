'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createDistrict, updateDistrict, deleteDistrict } from '@/features/geography/actions';

interface DistrictItem {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  isActive: boolean;
  sortOrder: number;
  state: {
    name: string;
  };
  _count: {
    articles: number;
  };
}

interface StateOption {
  id: string;
  name: string;
}

interface DistrictsManagerProps {
  initialDistricts: DistrictItem[];
  states: StateOption[];
}

export function DistrictsManager({ initialDistricts, states }: DistrictsManagerProps) {
  const [districts, setDistricts] = React.useState<DistrictItem[]>(initialDistricts);
  const [filterStateId, setFilterStateId] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Edit/create district form
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [stateId, setStateId] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setStateId(states[0]?.id || '');
    setSortOrder(0);
    setIsActive(true);
    setIsOpen(true);
  };

  const openEditModal = (dist: DistrictItem) => {
    setEditingId(dist.id);
    setName(dist.name);
    setStateId(dist.stateId);
    setSortOrder(dist.sortOrder);
    setIsActive(dist.isActive);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !stateId) {
      toast.error('District name and state selection are required');
      return;
    }

    startTransition(async () => {
      try {
        const stateName = states.find((s) => s.id === stateId)?.name || 'Unknown State';
        if (editingId) {
          const res = await updateDistrict(editingId, {
            name: name.trim(),
            stateId,
            sortOrder,
            isActive,
          });

          if (res.success) {
            toast.success(`District "${res.data.name}" updated successfully`);
            setDistricts((prev) =>
              prev.map((d) =>
                d.id === editingId
                  ? { ...d, ...res.data, state: { name: stateName } }
                  : d
              )
            );
            setIsOpen(false);
          }
        } else {
          const res = await createDistrict({
            name: name.trim(),
            stateId,
            sortOrder,
            isActive,
          });

          if (res.success) {
            toast.success(`District "${res.data.name}" created successfully`);
            setDistricts((prev) => [
              ...prev,
              {
                ...res.data,
                state: { name: stateName },
                _count: { articles: 0 },
              },
            ]);
            setIsOpen(false);
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save District');
      }
    });
  };

  const handleDelete = async (id: string, distName: string) => {
    if (!confirm(`Are you sure you want to delete district "${distName}"?`)) {
      return;
    }

    try {
      const res = await deleteDistrict(id);
      if (res.success) {
        toast.success(`District "${distName}" deleted successfully`);
        setDistricts((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete district');
    }
  };

  const filteredDistricts = filterStateId
    ? districts.filter((d) => d.stateId === filterStateId)
    : districts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reporting Districts</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure individual reporting districts associated with active states.</p>
        </div>
        <Button onClick={openNewModal} className="font-semibold gap-2">
          <Plus className="h-4 w-4" />
          Add District
        </Button>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-1 w-full md:w-[250px]">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Filter by State</span>
          <select
            value={filterStateId}
            onChange={(e) => setFilterStateId(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
          >
            <option value="">All States</option>
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {filteredDistricts.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <MapPin className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
              <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Districts Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Configure reporting districts associated with active states.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10">
                  <th className="py-3.5 px-6">District Name</th>
                  <th className="py-3.5 px-4">Associated State</th>
                  <th className="py-3.5 px-4 text-center">Articles</th>
                  <th className="py-3.5 px-4 text-center">Sort Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-sm font-semibold">
                {filteredDistricts.map((dist) => (
                  <tr key={dist.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6 text-zinc-900 dark:text-zinc-50">{dist.name}</td>
                    <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">{dist.state?.name}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">{dist._count.articles}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">{dist.sortOrder}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={dist.isActive ? 'success' : 'secondary'}>
                        {dist.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(dist)} className="h-8 gap-1">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dist.id, dist.name)} className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
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
            <DialogTitle>{editingId ? 'Edit District' : 'Add District'}</DialogTitle>
            <DialogDescription>Link the reporting district to its corresponding Indian state hub.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Associated State</label>
              <select
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              >
                {states.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">District Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Noida"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
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
                id="isActiveDist"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded"
              />
              <label htmlFor="isActiveDist" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Mark District as Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)} className="font-semibold">
                Cancel
              </Button>
              <Button disabled={isPending} type="submit" className="font-semibold gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create District'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
