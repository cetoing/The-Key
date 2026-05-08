'use client';

// Internships page with Neurodiverse Support Mode adaptations.
//
// Cognitive load adaptations applied here:
// - isLowCognitiveLoad: Type filter buttons are collapsed into a single
//   dropdown-style toggle when more than 2 types exist, reducing the number
//   of choices displayed in the filter bar.
// - show_guidance_prompts: GuidancePrompt appears when no skills are
//   set (instead of or alongside the amber warning banner), directing the
//   user to a single clear action rather than a generic warning message.
// - isMinimalText: InternshipCard description paragraph is hidden;
//   skill badges remain visible as they are the primary decision signal.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Internship, InternshipWithMatch, WishlistItem } from '@/lib/types';
import internshipsData from '@/data/internships.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  MapPin,
  Clock,
  Banknote,
  Heart,
  Search,
  Loader2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { AIExplainabilityPanel } from '@/components/ai/AIExplainabilityPanel';
import { buildMatchingExplainability } from '@/lib/explainability';
import { GuidancePrompt } from '@/components/neurodiverse/GuidancePrompt';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { scoreAllInternships } from '@/lib/matching';

function MatchBadge({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
    pct >= 40 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' :
    'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      <TrendingUp className="w-3 h-3" />
      {pct}% match
    </span>
  );
}

function InternshipCard({
  internship,
  saved,
  onToggleWishlist,
  hideDescription = false,
}: {
  internship: InternshipWithMatch;
  saved: boolean;
  onToggleWishlist: (internship: InternshipWithMatch) => void;
  // hideDescription: minimal text mode hides the prose description,
  // keeping only the structured data (skills, location, duration).
  // Reduces reading load for users with dyslexia or processing differences.
  hideDescription?: boolean;
}) {
  return (
    <Card className="group hover:border-primary/30 hover:shadow-sm transition-all">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground">{internship.title}</h3>
                <p className="text-sm text-muted-foreground">{internship.company}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <MatchBadge pct={internship.match_percentage} />
            <button
              onClick={() => onToggleWishlist(internship)}
              className={`p-1.5 rounded-lg transition-colors ${
                saved
                  ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
                  : 'text-muted-foreground hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
              aria-label={saved ? `Remove ${internship.title} from wishlist` : `Save ${internship.title} to wishlist`}
            >
              {saved ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Description hidden in minimal text mode to reduce reading burden.
            Skill badges below provide equivalent decision-making information
            in a more scannable format. */}
        {!hideDescription && (
          <p className="text-xs text-foreground/70 leading-relaxed mb-3 line-clamp-2">
            {internship.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />{internship.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />{internship.duration}
          </span>
          {internship.salary && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Banknote className="w-3 h-3" />{internship.salary}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {internship.skills_required.map((skill) => {
              const matched = internship.matched_skills.map(s => s.toLowerCase()).some(
                m => m.includes(skill.toLowerCase()) || skill.toLowerCase().includes(m)
              );
              return (
                <Badge
                  key={skill}
                  variant={matched ? 'default' : 'outline'}
                  className={`text-[10px] py-0.5 ${matched ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20' : ''}`}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
          {internship.matched_skills.length > 0 && (
            <p className="text-[10px] text-green-600 dark:text-green-400">
              You match {internship.matched_skills.length} of {internship.skills_required.length} required skills
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="text-[11px] text-muted-foreground">
            Open this role to view the match explanation and guided application flow.
          </p>
          <Link href={`/dashboard/internships/${internship.id}`}>
            <Button size="sm" className="text-xs">
              View Role
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InternshipsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { show_guidance_prompts, isLowCognitiveLoad, isMinimalText } = useAccessibility();

  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('skills').eq('user_id', user.id).maybeSingle(),
      supabase.from('wishlist').select('*').eq('user_id', user.id),
    ]).then(([profileRes, wishlistRes]) => {
      setUserSkills(((profileRes.data as { skills?: string[] } | null)?.skills) || []);
      const items = (wishlistRes.data as WishlistItem[]) || [];
      setWishlistIds(items.map((i) => i.internship_id));
    }).finally(() => setLoaded(true));
  }, [user]);

  const internships: Internship[] = internshipsData as Internship[];
  const withScores: InternshipWithMatch[] = scoreAllInternships(internships, userSkills, []);

  const uniqueTypes: string[] = [];
  internships.forEach((i) => { if (!uniqueTypes.includes(i.type)) uniqueTypes.push(i.type); });
  const types = ['All', ...uniqueTypes];

  const filtered = withScores.filter((i) => {
    const matchesSearch = !searchQuery ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.skills_required.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || i.type === selectedType;
    return matchesSearch && matchesType;
  });

  const top5 = filtered.slice(0, 5);

  const toggleWishlist = async (internship: InternshipWithMatch) => {
    if (!user) return;
    const isSaved = wishlistIds.includes(internship.id);

    if (isSaved) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('internship_id', internship.id);
      if (!error) {
        setWishlistIds((prev) => prev.filter((id) => id !== internship.id));
        toast({ title: 'Removed from wishlist' });
      }
    } else {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          internship_id: internship.id,
          internship_title: internship.title,
          company: internship.company,
          match_percentage: internship.match_percentage,
        })
        .select()
        .single();
      if (!error && data) {
        setWishlistIds((prev) => [...prev, internship.id]);
        toast({ title: 'Added to wishlist', description: `${internship.title} saved.` });
      }
    }
  };

  const savedInternships = withScores.filter((i) => wishlistIds.includes(i.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Internship Suggestions
        </h1>
        <p className="text-muted-foreground mt-1">
          Roles matched to your skills - sorted by relevance.
          {userSkills.length === 0 && ' Add skills to your profile for better matches.'}
        </p>
      </div>

      {/* No-skills warning: in guidance prompt mode, replace the generic amber
          banner with a focused GuidancePrompt that provides one clear action.
          Standard mode retains the amber warning for users who prefer it. */}
      {userSkills.length === 0 && show_guidance_prompts ? (
        <GuidancePrompt
          id="internships-add-skills"
          headline="Add your skills to see match scores"
          reason="The matching system compares your profile skills against each role's requirements. Without skills, all roles show 0% and sorting by relevance has no effect."
          action={{ label: 'Add Skills to Profile', href: '/dashboard/profile' }}
        />
      ) : userSkills.length === 0 ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">No skills in your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visit your Profile page and add skills to get personalised match scores.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by role, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {/* Low cognitive load: hide type filter buttons when in this mode
            to reduce the number of choices in the filter bar.
            Search is kept as it's an active user action rather than a choice. */}
        {!isLowCognitiveLoad && (
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </div>

      <AIExplainabilityPanel
        data={buildMatchingExplainability(userSkills)}
        defaultOpen={false}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top Matches
          </h2>
          <Badge variant="outline" className="text-xs">
            Showing top {Math.min(5, filtered.length)} of {filtered.length}
          </Badge>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : top5.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {top5.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                saved={wishlistIds.includes(internship.id)}
                onToggleWishlist={toggleWishlist}
                hideDescription={isMinimalText}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No internships match your search.</p>
          </div>
        )}
      </div>

      {savedInternships.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              My Wishlist ({savedInternships.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {savedInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                saved={true}
                onToggleWishlist={toggleWishlist}
                hideDescription={isMinimalText}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
