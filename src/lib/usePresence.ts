'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  isOnline: boolean;
  lastSeen: string | null;
  displayText: string;
  isLoading: boolean;
}

interface UsePresenceOptions {
  userId: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

export function usePresence({ userId, autoUpdate = true, updateInterval = 60000 }: UsePresenceOptions) {
  const [presence, setPresence] = useState<PresenceState>({
    isOnline: false,
    lastSeen: null,
    displayText: 'Loading...',
    isLoading: true,
  });

  const channelsRef = useRef<RealtimeChannel[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time in human-friendly way
  const formatLastSeen = useCallback((lastSeen: string | null): string => {
    if (!lastSeen) return 'Never';

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays === 1) {
      return `Yesterday ${lastSeenDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else if (diffDays < 7) {
      return lastSeenDate.toLocaleDateString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return lastSeenDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }, []);

  // Update display text based on current state
  const updateDisplayText = useCallback((isOnline: boolean, lastSeen: string | null): string => {
    if (isOnline) {
      return '🟢 Online Now';
    } else {
      const timeText = formatLastSeen(lastSeen);
      return `🔴 Offline · ${timeText}`;
    }
  }, [formatLastSeen]);

  // Update presence state
  const updatePresenceState = useCallback((isOnline: boolean, lastSeen: string | null) => {
    const displayText = updateDisplayText(isOnline, lastSeen);
    setPresence({
      isOnline,
      lastSeen,
      displayText,
      isLoading: false,
    });
  }, [updateDisplayText]);

  // Fetch initial presence
  const fetchInitialPresence = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, last_seen')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching initial presence:', error);
        setPresence(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const isOnline = data?.is_online || false;
      const lastSeen = data?.last_seen || null;
      updatePresenceState(isOnline, lastSeen);
    } catch (err) {
      console.error('Failed to fetch initial presence:', err);
      setPresence(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, updatePresenceState]);

  // Set up real-time subscription
  useEffect(() => {
    fetchInitialPresence();

    const presenceChannel = supabase
      .channel(`presence_${userId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.new) {
            const isOnline = payload.new.is_online || false;
            const lastSeen = payload.new.last_seen || null;
            updatePresenceState(isOnline, lastSeen);
          }
        }
      )
      .subscribe();

    channelsRef.current.push(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [userId, fetchInitialPresence, updatePresenceState]);

  // Auto-update display text for offline users
  useEffect(() => {
    if (!autoUpdate || presence.isOnline) {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      return;
    }

    updateIntervalRef.current = setInterval(() => {
      setPresence(prev => ({
        ...prev,
        displayText: updateDisplayText(prev.isOnline, prev.lastSeen),
      }));
    }, updateInterval);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [autoUpdate, updateInterval, presence.isOnline, updateDisplayText]);

  // Cleanup on unmount
  useEffect(() => {
    const currentChannels = channelsRef.current;

    return () => {
      currentChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return presence;
}

// Hook for managing user's own presence (for admin)
export function useOwnPresence(userId: string) {
  const [isOnline, setIsOnline] = useState(true);

  // Initialize presence by checking current database state
  useEffect(() => {
    const initializePresence = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('is_online')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching current presence:', error);
        } else if (data) {
          setIsOnline(data.is_online || false);
        }

        // Always ensure there's a presence record
        const { error: upsertError } = await supabase.from('user_presence').upsert({
          user_id: userId,
          is_online: data?.is_online || true,
          last_seen: new Date().toISOString(),
        });

        if (upsertError) console.error('Error setting presence:', upsertError);
      } catch (err) {
        console.error('Failed to initialize presence:', err);
      }
    };

    initializePresence();

    // Update presence every 30 seconds only if currently online
    const interval = setInterval(async () => {
      if (isOnline) {
        await supabase.from('user_presence').upsert({
          user_id: userId,
          is_online: true,
          last_seen: new Date().toISOString(),
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, isOnline]);

  // Mark offline on tab close
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await supabase
          .from('user_presence')
          .update({
            is_online: false,
            last_seen: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } catch (error) {
        console.error('Error marking offline on tab close:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  const goOffline = useCallback(async () => {
    setIsOnline(false);
    try {
      await supabase
        .from('user_presence')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error going offline:', error);
      setIsOnline(true); // Revert on error
    }
  }, [userId]);

  const goOnline = useCallback(async () => {
    setIsOnline(true);
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          is_online: true,
          last_seen: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error going online:', error);
      setIsOnline(false); // Revert on error
    }
  }, [userId]);

  return { isOnline, goOffline, goOnline };
}
