import { useState, useRef, useCallback, useEffect } from "react";

interface UseBatchRequestsOptions<T, R> {
  batchSize?: number;
  requestFn: (url: T, signal?: AbortSignal) => Promise<R>;
}

export default function useBatchRequests<T, R>(
  urls: T[],
  options: UseBatchRequestsOptions<T, R>
) {
  const { batchSize = 10, requestFn } = options;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<R[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startBatchRequests = useCallback(async () => {
    if (loading) {
      return; // Avoid starting new requests if already loading
    }

    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let startIndex = 0;
    const allResults: R[] = [];

    try {
      while (startIndex < urls.length) {
        if (signal.aborted) {
          console.log("批量请求被取消");
          break;
        }

        const endIndex = Math.min(startIndex + batchSize, urls.length);
        const batchUrls = urls.slice(startIndex, endIndex);

        console.log(`发起新的批次请求 (${startIndex + 1} - ${endIndex})`);

        const batchPromises = batchUrls.map((url) => requestFn(url, signal));

        try {
          const batchResults = await Promise.all(batchPromises);
          allResults.push(...batchResults);
          setResults((prevResults) => [...prevResults, ...batchResults]);
        } catch (batchError: any) {
          if (batchError.name === "AbortError") {
            console.log("当前批次请求被取消");
            break;
          }
          setError(batchError);
          break; // Stop further batches if an error occurs in a batch
        }

        startIndex = endIndex;
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [urls, batchSize, requestFn, loading]);

  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      // 组件卸载时取消请求
      cancelRequests();
    };
  }, [cancelRequests]);

  return {
    loading,
    results,
    error,
    startBatchRequests,
    cancelRequests,
  };
}

export { useBatchRequests };
