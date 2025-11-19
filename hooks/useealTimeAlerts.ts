import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function useRealtimeAlerts(
    userId: string | undefined,
    onNewAlert: (alert: any) => void
) {
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`danger_alerts_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'danger_alerts',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => onNewAlert(payload.new)
            )
            .subscribe();

        // IMPORTANT: Don't return the Promise!
        return () => {
            supabase.removeChannel(channel);  // fire and forget
        };
    }, [userId, onNewAlert]);
}
