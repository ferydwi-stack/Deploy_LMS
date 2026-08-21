import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

const BROADCAST_CHANNEL_NAME = 'lms-realtime-channel';

/**
 * Broadcast a data mutation event to the current window and all other active browser tabs.
 */
export function broadcastDataMutation(events: string | string[]) {
  if (typeof window === 'undefined') return;

  const eventList = Array.isArray(events) ? events : [events];

  eventList.forEach((eventName) => {
    const normalizedEvent = eventName.startsWith('lms:') ? eventName : `lms:${eventName}`;
    
    // 1. Dispatch custom event in current window
    try {
      window.dispatchEvent(new CustomEvent(normalizedEvent, { detail: { timestamp: Date.now() } }));
      window.dispatchEvent(new CustomEvent('lms:any-mutation', { detail: { event: normalizedEvent, timestamp: Date.now() } }));
    } catch {
      // Ignore in environments where CustomEvent might be restricted
    }

    // 2. Broadcast across tabs via BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ event: normalizedEvent, timestamp: Date.now() });
        channel.close();
      }
    } catch {
      // Ignore if BroadcastChannel is unsupported or restricted
    }
  });
}

export function useRealtimeData<T>(
  fetchData: () => Promise<T>,
  refreshInterval = 10000,
  deps: readonly unknown[] = [],
  eventNames?: string | string[]
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDataRef = useRef(fetchData);
  const isMountedRef = useRef(true);
  const lastFetchedTimeRef = useRef<number>(0);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  const targetEvents = useMemo(() => {
    if (!eventNames) return [];
    const list = Array.isArray(eventNames) ? eventNames : [eventNames];
    return list.map((e) => (e.startsWith('lms:') ? e : `lms:${e}`));
  }, [eventNames]);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading && isMountedRef.current) {
      setLoading(true);
    }

    try {
      const result = await fetchDataRef.current();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        lastFetchedTimeRef.current = Date.now();
      }
    } catch (caughtError) {
      if (isMountedRef.current) {
        setError(caughtError instanceof Error ? caughtError : new Error('Unknown error'));
      }
    } finally {
      if (isMountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Initial load on mount or deps change
  useEffect(() => {
    void load(true);
  }, [load, depsKey]);

  // Periodic Smart Polling (stops when tab is hidden / inactive)
  useEffect(() => {
    if (refreshInterval <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        void load(false);
      }
    }, refreshInterval);

    return () => window.clearInterval(intervalId);
  }, [load, refreshInterval, depsKey]);

  // Window Focus & Visibility Revalidation (fetches silently if stale > 2.5s)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRevalidate = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const now = Date.now();
      if (now - lastFetchedTimeRef.current > 2500) {
        void load(false);
      }
    };

    window.addEventListener('focus', handleRevalidate);
    window.addEventListener('online', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      window.removeEventListener('online', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [load]);

  // Event-Driven Mutation Listeners (Current Window + Cross-Tab BroadcastChannel)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMutationEvent = () => {
      void load(false);
    };

    // Listen to local CustomEvents in this window
    targetEvents.forEach((evt) => {
      window.addEventListener(evt, handleMutationEvent);
    });

    // Listen to cross-tab BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (msg: MessageEvent) => {
          const receivedEvent = msg?.data?.event;
          if (
            receivedEvent &&
            (targetEvents.length === 0 || targetEvents.includes(receivedEvent) || targetEvents.includes('lms:*'))
          ) {
            void load(false);
          }
        };
      }
    } catch {
      // Graceful fallback if channel creation fails
    }

    return () => {
      targetEvents.forEach((evt) => {
        window.removeEventListener(evt, handleMutationEvent);
      });
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [targetEvents, load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return { data, loading, error, refresh };
}
