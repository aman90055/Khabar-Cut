'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function RecalculateTrendingButton() {
  const [loading, setLoading] = React.useState(false);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trending/recalculate', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Processed ${data.processed} articles. ${data.trending} set as trending.`);
      } else {
        throw new Error(data.error || 'Failed to recalculate');
      }
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Error recalculating trending');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleRecalculate} 
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Recalculate Trending
    </Button>
  );
}
