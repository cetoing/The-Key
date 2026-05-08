'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  MoreHorizontal,
  Plus,
  Save,
  StickyNote,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';

const COLUMNS: { status: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { status: 'Saved', label: 'Saved', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  { status: 'Applied', label: 'Applied', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { status: 'Interview', label: 'Interview', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { status: 'Offer', label: 'Offer', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { status: 'Rejected', label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

const STATUS_ORDER = COLUMNS.map((c) => c.status);

function MatchBadge({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
    pct >= 40 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
    'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      <TrendingUp className="w-2.5 h-2.5" />{pct}%
    </span>
  );
}

function EditModal({
  app,
  onSave,
  onClose,
}: {
  app: Application;
  onSave: (id: string, notes: string, reminderDate: string) => Promise<void>;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(app.notes);
  const [reminderDate, setReminderDate] = useState(app.reminder_date || '');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(app.id, notes, reminderDate);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${app.internship_title}`}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">{app.internship_title}</h2>
              <p className="text-sm text-muted-foreground">{app.company}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this application..."
              className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reminder" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />Reminder Date
            </label>
            <input
              id="reminder"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {reminderDate && (
              <button
                onClick={() => setReminderDate('')}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Clear reminder
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
            <Button onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ApplicationCard({
  app,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  app: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const hasFutureReminder = app.reminder_date && new Date(app.reminder_date) >= new Date(new Date().toDateString());
  const isOverdue = app.reminder_date && new Date(app.reminder_date) < new Date(new Date().toDateString());

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-background border border-border rounded-xl p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing select-none transition-all ${
        dragging ? 'opacity-50 scale-95 rotate-1' : 'hover:border-primary/30 hover:shadow-sm'
      }`}
      aria-label={`${app.internship_title} at ${app.company}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{app.internship_title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground truncate">{app.company}</p>
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Card options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 bg-background border border-border rounded-xl shadow-lg min-w-[140px] py-1 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onEdit(app); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
              >
                <Edit3 className="w-3.5 h-3.5" />Edit notes
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(app.id); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-destructive/10 text-destructive transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {app.match_percentage > 0 && <MatchBadge pct={app.match_percentage} />}
        {hasFutureReminder && (
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
            <Calendar className="w-2.5 h-2.5" />
            {new Date(app.reminder_date!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {isOverdue && (
          <span className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            <Calendar className="w-2.5 h-2.5" />Overdue
          </span>
        )}
      </div>

      {app.notes && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 border-t border-border pt-2">
          {app.notes}
        </p>
      )}

      <div className="flex items-center gap-1 pt-0.5" role="group" aria-label="Move card between columns">
        <button
          onClick={() => onMoveLeft(app.id)}
          disabled={!canMoveLeft}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-1.5 py-1 rounded hover:bg-muted"
          aria-label="Move to previous column"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <button
          onClick={() => onEdit(app)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded hover:bg-muted flex-1 justify-center"
          aria-label="Edit this application"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={() => onMoveRight(app.id)}
          disabled={!canMoveRight}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-1.5 py-1 rounded hover:bg-muted"
          aria-label="Move to next column"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  apps,
  onEdit,
  onDelete,
  onMove,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  column: typeof COLUMNS[number];
  apps: Application[];
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: ApplicationStatus) => void;
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (status: ApplicationStatus) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const colIdx = STATUS_ORDER.indexOf(column.status);

  return (
    <div
      className={`flex flex-col min-h-[400px] rounded-2xl border transition-all ${
        dragOver ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/20'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(column.status); }}
      role="region"
      aria-label={`${column.label} column, ${apps.length} application${apps.length !== 1 ? 's' : ''}`}
    >
      <div className="px-3.5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
          {apps.length > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${column.bg}`}>
              {apps.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto">
        {apps.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50 text-center px-4">
            Drop cards here
          </div>
        )}
        {apps.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveLeft={(id) => {
              const prevStatus = STATUS_ORDER[colIdx - 1];
              if (prevStatus) onMove(id, prevStatus);
            }}
            onMoveRight={(id) => {
              const nextStatus = STATUS_ORDER[colIdx + 1];
              if (nextStatus) onMove(id, nextStatus);
            }}
            canMoveLeft={colIdx > 0}
            canMoveRight={colIdx < STATUS_ORDER.length - 1}
            dragging={draggingId === app.id}
            onDragStart={() => onDragStart(app.id)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApplications((data as Application[]) || []);
        setLoading(false);
      });
  }, [user]);

  const updateApp = (id: string, patch: Partial<Application>) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const moveCard = async (id: string, newStatus: ApplicationStatus) => {
    updateApp(id, { status: newStatus });
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      const orig = applications.find((a) => a.id === id);
      if (orig) updateApp(id, { status: orig.status });
      toast({ title: 'Failed to move card', variant: 'destructive' });
    }
  };

  const saveEdit = async (id: string, notes: string, reminderDate: string) => {
    const patch = { notes, reminder_date: reminderDate || null, updated_at: new Date().toISOString() };
    updateApp(id, patch as Partial<Application>);
    const { error } = await supabase.from('applications').update(patch).eq('id', id);
    if (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } else {
      toast({ title: 'Saved' });
    }
  };

  const deleteApp = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to remove application', variant: 'destructive' });
    } else {
      toast({ title: 'Application removed' });
    }
  };

  const handleDrop = async (targetStatus: ApplicationStatus) => {
    if (!draggingId) return;
    await moveCard(draggingId, targetStatus);
    setDraggingId(null);
  };

  const byStatus = (status: ApplicationStatus) => applications.filter((a) => a.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Applications Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your applications through each stage. Drag cards between columns or use the arrow buttons.
          </p>
        </div>
        <Badge variant="outline" className="text-xs whitespace-nowrap mt-1">
          {applications.length} tracked
        </Badge>
      </div>

      {applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-sm">No applications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Open an internship and click &quot;Add to Tracker&quot; to start tracking.
            </p>
          </CardContent>
        </Card>
      )}

      {applications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              column={col}
              apps={byStatus(col.status)}
              onEdit={setEditingApp}
              onDelete={deleteApp}
              onMove={moveCard}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {editingApp && (
        <EditModal
          app={editingApp}
          onSave={saveEdit}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}
