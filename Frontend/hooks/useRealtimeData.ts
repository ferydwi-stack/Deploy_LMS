import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

export function useRealtimeData<T>(
  fetchData: () => Promise<T>,
  refreshInterval = 45000,
  deps: readonly unknown[] = [],
  eventName?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchDataRef = useRef(fetchData);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const result = await fetchDataRef.current();
      setData(result);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load, depsKey]);

  useEffect(() => {
    if (refreshInterval <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        void load();
      }
    }, refreshInterval);

    return () => window.clearInterval(intervalId);
  }, [load, refreshInterval, depsKey]);

  useEffect(() => {
    if (!eventName || typeof window === 'undefined') return;
    const handler = () => void load(false);
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName, load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return { data, loading, error, refresh };
}
