import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function createAuditLog(entry: {
  action: string;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  payload?: Record<string, unknown>;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from('audit_logs').insert({
      actor_user_id: entry.actorUserId ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      payload: entry.payload ?? {},
    });
  } catch (error) {
    console.error('Audit log write failed', error);
  }
}
