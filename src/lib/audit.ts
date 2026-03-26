import { supabase } from '@/integrations/supabase/client';

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email || 'Unknown',
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
    });
  } catch {
    // Audit logging should never break the app
  }
}
