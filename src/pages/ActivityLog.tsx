import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from 'lucide-react';

interface AuditLog {
  id: string;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

export default function ActivityLog() {
  const { hasRole } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setLogs(data as AuditLog[]);
    setLoading(false);
  };

  if (!hasRole('admin') && !hasRole('treasurer') && !hasRole('secretary')) {
    return (
      <div>
        <h1 className="page-title">Activity Log</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const actionColor = (action: string) => {
    if (action.includes('add') || action.includes('create')) return 'default' as const;
    if (action.includes('update') || action.includes('edit')) return 'secondary' as const;
    if (action.includes('delete') || action.includes('remove')) return 'destructive' as const;
    return 'outline' as const;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">Track who did what on the system</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map(log => (
                <div key={log.id} className="p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.user_name || 'System'}</span>
                      <Badge variant={actionColor(log.action)} className="text-xs">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">{log.entity_type}</span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleString('en-ZA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
