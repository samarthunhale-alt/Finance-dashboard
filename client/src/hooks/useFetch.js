import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api.js';

/**
 * Runs `fetcher` (must resolve to the API response body) whenever `deps` change.
 * Returns { data, body, loading, error, reload }.
 */
export function useFetch(fetcher, deps = []) {
  const [body, setBody] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => { if (!cancelled) setBody(res); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: body?.data ?? null, body, loading, error, reload };
}
