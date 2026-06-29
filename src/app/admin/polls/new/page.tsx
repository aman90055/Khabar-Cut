'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty'),
});

const schema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(250),
  options: z.array(optionSchema).min(2, 'At least 2 options are required'),
  isActive: z.boolean(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type FormInput = z.infer<typeof schema>;

export default function NewPollPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        question: data.question,
        options: data.options.map((opt) => opt.text),
        isActive: data.isActive,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Poll created successfully');
        router.push('/admin/polls');
      } else {
        throw new Error('Failed to create poll');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/polls"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create Poll</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Question */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Poll Question</label>
              <input
                type="text"
                {...register('question')}
                placeholder="e.g. Do you support the new EV subsidy policy?"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              {errors.question && <p className="text-xs text-red-500">{errors.question.message}</p>}
            </div>

            {/* Options list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Options</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ text: '' })}
                  className="h-8 font-bold text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </Button>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    type="text"
                    {...register(`options.${idx}.text`)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2"
                  />
                  {fields.length > 2 && (
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded" />
              <label htmlFor="isActive" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Activate immediately on publish
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/polls')}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit" className="font-semibold gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Poll
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
