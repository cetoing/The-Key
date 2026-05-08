import { supabase } from './supabase';
import type { Profile } from './types';

type ProfileRecord = Profile & Record<string, unknown>;

async function queryProfileByColumn(column: 'id' | 'user_id', userId: string) {
  return supabase.from('profiles').select('*').eq(column, userId).maybeSingle();
}

export async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const byUserId = await queryProfileByColumn('user_id', userId);
  if (byUserId.data) return byUserId.data as ProfileRecord;

  const byId = await queryProfileByColumn('id', userId);
  return (byId.data as ProfileRecord | null) ?? null;
}
