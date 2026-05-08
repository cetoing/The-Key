import { supabase } from './supabase';

export type EventType =
  | 'cv_generation'
  | 'cv_item_created'
  | 'internship_saved'
  | 'application_created'
  | 'interview_session_started'
  | 'interview_session_completed'
  | 'profile_completed'
  | 'page_view';

export async function logEvent(
  userId: string,
  eventType: EventType,
  metadata: Record<string, string | number | boolean> = {},
) {
  if (!userId) return;
  await supabase.from('usage_metrics').insert({
    user_id: userId,
    event_type: eventType,
    event_date: new Date().toISOString().slice(0, 10),
    metadata,
  });
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface EventSummary {
  event_type: EventType;
  total: number;
}

export interface AggregateStats {
  totalUsers: number;
  totalEvents: number;
  cvGenerations: number;
  internshipSaves: number;
  applicationsCreated: number;
  interviewSessionsStarted: number;
  interviewSessionsCompleted: number;
  profilesCompleted: number;
  dailyActivity: DailyCount[];
  eventBreakdown: EventSummary[];
  completionRate: number;
}

export async function fetchAggregateAnalytics(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<AggregateStats> {
  const [ownRes, dailyRes, breakdownRes, profileCountRes, generatedCVCountRes, wishlistCountRes, appsCountRes, sessionsCountRes] =
    await Promise.all([
      supabase
        .from('usage_metrics')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate),

      supabase
        .from('usage_metrics')
        .select('event_date')
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true }),

      supabase
        .from('usage_metrics')
        .select('event_type')
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate),

      supabase
        .from('profiles')
        .select('full_name,course,university,skills,bio')
        .eq('user_id', userId)
        .maybeSingle(),

      supabase
        .from('generated_cvs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('wishlist')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('interview_sessions')
        .select('id,status', { count: 'exact' })
        .eq('user_id', userId),
    ]);

  const allEvents: Array<{ event_type: string }> = breakdownRes.data ?? [];

  const countByType = (type: string) =>
    allEvents.filter((e) => e.event_type === type).length;

  const dateCountMap: Record<string, number> = {};
  for (const row of dailyRes.data ?? []) {
    const d = row.event_date as string;
    dateCountMap[d] = (dateCountMap[d] ?? 0) + 1;
  }

  const dailyActivity: DailyCount[] = Object.entries(dateCountMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const uniqueEventTypes: EventType[] = [
    'cv_generation',
    'cv_item_created',
    'internship_saved',
    'application_created',
    'interview_session_started',
    'interview_session_completed',
    'profile_completed',
    'page_view',
  ];

  const eventBreakdown: EventSummary[] = uniqueEventTypes
    .map((type) => ({ event_type: type, total: countByType(type) }))
    .filter((e) => e.total > 0);

  const profile = profileCountRes.data as any;
  const profileFields = profile
    ? [profile.full_name, profile.course, profile.university, profile.bio, (profile.skills?.length ?? 0) > 0]
    : [];
  const completedFields = profileFields.filter(Boolean).length;
  const completionRate = profile ? Math.round((completedFields / 5) * 100) : 0;

  const completedSessions =
    (sessionsCountRes.data ?? []).filter((s: any) => s.status === 'completed').length;

  return {
    totalUsers: 1,
    totalEvents: ownRes.count ?? 0,
    cvGenerations: generatedCVCountRes.count ?? 0,
    internshipSaves: wishlistCountRes.count ?? 0,
    applicationsCreated: appsCountRes.count ?? 0,
    interviewSessionsStarted: sessionsCountRes.count ?? 0,
    interviewSessionsCompleted: completedSessions,
    profilesCompleted: completionRate >= 80 ? 1 : 0,
    dailyActivity,
    eventBreakdown,
    completionRate,
  };
}

export const EVENT_LABELS: Record<EventType, string> = {
  cv_generation: 'CV Generations',
  cv_item_created: 'CV Items Created',
  internship_saved: 'Internships Saved',
  application_created: 'Applications Created',
  interview_session_started: 'Interview Sessions Started',
  interview_session_completed: 'Interview Sessions Completed',
  profile_completed: 'Profile Completed',
  page_view: 'Page Views',
};
