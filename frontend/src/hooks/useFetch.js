import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `fetcher` on mount and whenever `deps` change.
 * Keeps the previous data while refetching (no flicker on pagination / filters).
 */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    const id = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (id === latest.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === latest.current) setState((s) => ({ ...s, loading: false, error }));
    }
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { ...state, refetch: run };
}
