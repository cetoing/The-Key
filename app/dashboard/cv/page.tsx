'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { cvItemSchema, type CVItemFormData } from '@/lib/validations';
import type { CVItem, CVItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, FileText, Download, Briefcase, GraduationCap, Star, Wrench } from 'lucide-react';

const typeConfig: Record<CVItemType, { icon: React.ElementType; label: string; color: string }> = {
  work: { icon: Briefcase, label: 'Work Experience', color: 'bg-blue-500/10 text-blue-600' },
  education: { icon: GraduationCap, label: 'Education', color: 'bg-green-500/10 text-green-600' },
  achievement: { icon: Star, label: 'Achievement', color: 'bg-amber-500/10 text-amber-600' },
  skill: { icon: Wrench, label: 'Skill', color: 'bg-primary/10 text-primary' },
};

function CVItemCard({ item, onDelete }: { item: CVItem; onDelete: (id: string) => void }) {
  const { icon: Icon, label, color } = typeConfig[item.type as CVItemType] || typeConfig.work;
  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-foreground">{item.title}</p>
            {item.organisation && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.organisation}</p>
            )}
            {(item.start_date || item.end_date) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.start_date}{item.start_date && (item.is_current || item.end_date) ? ' – ' : ''}
                {item.is_current ? 'Present' : item.end_date}
              </p>
            )}
            {item.description && (
              <p className="text-xs text-foreground/70 mt-2 leading-relaxed line-clamp-2">{item.description}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <Badge variant="outline" className="text-[10px] mt-2">{label}</Badge>
      </div>
    </div>
  );
}

function CVPreview({ items, name }: { items: CVItem[]; name: string }) {
  const sections = Object.keys(typeConfig) as CVItemType[];
  return (
    <div className="bg-white border border-border rounded-xl p-8 text-[13px] leading-relaxed shadow-sm" role="document" aria-label="CV Preview">
      <div className="border-b-2 border-[hsl(20,16%,12%)] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[hsl(20,14%,10%)]">{name || 'Your Name'}</h2>
        <p className="text-sm text-gray-500 mt-1">Curriculum Vitae</p>
      </div>

      {sections.map((type) => {
        const sectionItems = items.filter((i) => i.type === type);
        if (!sectionItems.length) return null;
        const { label, icon: Icon } = typeConfig[type];
        return (
          <div key={type} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-3.5 h-3.5 text-[hsl(25,85%,48%)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,85%,48%)]">{label}</h3>
            </div>
            <div className="space-y-3 pl-5 border-l-2 border-gray-100">
              {sectionItems.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-[hsl(20,14%,10%)]">{item.title}</p>
                    {(item.start_date || item.end_date) && (
                      <p className="text-xs text-gray-500 text-right">
                        {item.start_date}{item.start_date && (item.is_current || item.end_date) ? ' – ' : ''}
                        {item.is_current ? 'Present' : item.end_date}
                      </p>
                    )}
                  </div>
                  {item.organisation && (
                    <p className="text-gray-600 text-xs">{item.organisation}</p>
                  )}
                  {item.description && (
                    <p className="text-gray-700 mt-1 text-xs leading-relaxed">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-12 text-sm">
          Add entries to see your CV preview here.
        </p>
      )}
    </div>
  );
}

export default function CVBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CVItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [activeType, setActiveType] = useState<CVItemType>('work');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CVItemFormData>({
    resolver: zodResolver(cvItemSchema),
    defaultValues: { type: 'work', title: '', organisation: '', start_date: '', end_date: '', description: '', is_current: false, order_index: 0 },
  });

  const isCurrent = watch('is_current');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('cv_items').select('*').eq('user_id', user.id).order('order_index'),
      supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
    ]).then(([itemsRes, profileRes]) => {
      setItems((itemsRes.data as CVItem[]) || []);
      setProfileName(profileRes.data?.full_name || '');
      setLoading(false);
    });
  }, [user]);

  const onSubmit = async (data: CVItemFormData) => {
    if (!user) return;
    setSaving(true);
    const { data: newItem, error } = await supabase
      .from('cv_items')
      .insert({
        user_id: user.id,
        ...data,
        type: activeType,
        order_index: items.length,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast({ title: 'Failed to add entry', description: error.message, variant: 'destructive' });
      return;
    }
    setItems((prev) => [...prev, newItem as CVItem]);
    reset({ type: activeType, title: '', organisation: '', start_date: '', end_date: '', description: '', is_current: false, order_index: 0 });
    setShowForm(false);
    toast({ title: 'Entry added', description: `${data.title} added to your CV.` });
  };

  const onInvalid: SubmitErrorHandler<CVItemFormData> = (formErrors) => {
    const firstMessage = Object.values(formErrors).find((error) => error?.message)?.message;
    toast({
      title: 'Check this entry',
      description: firstMessage || 'Please complete the required fields before saving.',
      variant: 'destructive',
    });
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('cv_items').delete().eq('id', id);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: 'Entry removed' });
    }
  };

  const handleAddNew = (type: CVItemType) => {
    setActiveType(type);
    setValue('type', type);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            CV Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Add your experiences, education, and achievements to build your CV.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(typeConfig) as CVItemType[]).map((type) => {
              const { icon: Icon, label, color } = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => handleAddNew(type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all text-center"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
                </button>
              );
            })}
          </div>

          {showForm && (
            <Card className="border-primary/30 bg-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Add {typeConfig[activeType].label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3">
                  <input type="hidden" {...register('type')} value={activeType} />
                  <div className="space-y-1.5">
                    <Label htmlFor="cv-title">
                      {activeType === 'skill' ? 'Skill Name' : 'Title / Role'} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="cv-title" placeholder={
                      activeType === 'work' ? 'e.g. Software Developer Intern' :
                      activeType === 'education' ? 'e.g. BSc Computer Science' :
                      activeType === 'achievement' ? 'e.g. Dean\'s List Award' :
                      'e.g. JavaScript'
                    } {...register('title')} />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  </div>

                  {activeType !== 'skill' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="cv-org">
                        {activeType === 'education' ? 'Institution' : 'Organisation / Company'}
                      </Label>
                      <Input id="cv-org" placeholder={activeType === 'education' ? 'e.g. University of Manchester' : 'e.g. Google UK'} {...register('organisation')} />
                    </div>
                  )}

                  {activeType !== 'skill' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cv-start">Start Date</Label>
                        <Input id="cv-start" placeholder="e.g. Sept 2023" {...register('start_date')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cv-end">End Date</Label>
                        <Input id="cv-end" placeholder="e.g. June 2024" disabled={isCurrent} {...register('end_date')} />
                      </div>
                    </div>
                  )}

                  {activeType !== 'skill' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is-current"
                        checked={isCurrent}
                        onCheckedChange={(v) => setValue('is_current', v)}
                      />
                      <Label htmlFor="is-current" className="text-sm font-normal">Currently ongoing</Label>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="cv-desc">Description</Label>
                    <Textarea
                      id="cv-desc"
                      placeholder="Briefly describe your responsibilities, achievements, or skills..."
                      className="resize-none"
                      rows={3}
                      {...register('description')}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add Entry
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {items.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">{items.length} {items.length === 1 ? 'entry' : 'entries'} added</p>
              {items.map((item) => (
                <CVItemCard key={item.id} item={item} onDelete={deleteItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No entries yet. Click a category above to add your first one.</p>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</h2>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="sm:hidden">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <CVPreview items={items} name={profileName} />
        </div>
      </div>
    </div>
  );
}
