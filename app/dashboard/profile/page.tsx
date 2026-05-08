'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import type { Profile } from '@/lib/types';
import { fetchProfile } from '@/lib/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, User, GraduationCap, Wrench, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function SkillsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const remove = (skill: string) => onChange(value.filter((s) => s !== skill));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. React, Python, Communication..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="flex-shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1.5 text-xs py-1">
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', course: '', university: '', skills: [], bio: '' },
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((data) => {
        if (data) {
          reset({
            full_name: data.full_name || '',
            course: data.course || '',
            university: data.university || '',
            skills: data.skills || [],
            bio: data.bio || '',
          });
        }
        setLoading(false);
      });
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile saved', description: 'Your profile has been updated successfully.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Keep your profile up to date — it&apos;s used to generate your CV and match internships.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="full_name" placeholder="Alex Johnson" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself and your career goals..."
                className="resize-none"
                rows={3}
                {...register('bio')}
              />
              <p className="text-xs text-muted-foreground">Up to 500 characters</p>
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Academic Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course">Course / Degree <span className="text-destructive">*</span></Label>
              <Input
                id="course"
                placeholder="e.g. BSc Computer Science"
                {...register('course')}
              />
              {errors.course && <p className="text-xs text-destructive">{errors.course.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="university">University <span className="text-destructive">*</span></Label>
              <Input
                id="university"
                placeholder="e.g. University of Manchester"
                {...register('university')}
              />
              {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Skills
            </CardTitle>
            <CardDescription>
              Add your technical and soft skills. Press Enter or click + to add each one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <SkillsInput value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.skills && <p className="text-xs text-destructive mt-2">{errors.skills.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto min-w-32">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
