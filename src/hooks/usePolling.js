import { useEffect, useRef, useState } from "react";

export default function usePolling(
  fetcher,
  { interval = 10000, enabled = true } = {},
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [retryDelay, setRetryDelay] = useState(interval);
  const timerRef = useRef(null);
  const fetchRef = useRef(fetcher);

  useEffect(() => {
    fetchRef.current = fetcher;
  }, [fetcher]);

  const refresh = async (opts = {}) => {
    const { silent = false } = opts;
    if (!silent) setLoading(true);
    setError("");

    try {
      const result = await fetchRef.current();
      setData(result);
      setRetryDelay(interval);
      return result;
    } catch (err) {
      setError(err?.message || "Connexion perdue");
      setRetryDelay((previous) => Math.min(previous * 2, 60000));
      throw err;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState === "hidden") {
        timerRef.current = window.setTimeout(tick, interval);
        return;
      }

      try {
        await refresh({ silent: true });
      } catch {
        // erreur gérée dans refresh
      } finally {
        if (active) {
          timerRef.current = window.setTimeout(tick, retryDelay);
        }
      }
    };

    tick();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh({ silent: true }).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, interval, retryDelay]);

  return { data, loading, error, refresh, retryDelay };
}
