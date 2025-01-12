import { useState, useCallback } from "react";

export interface UseCounterOptions {
  min?: number;
  max?: number;
  initial?: number;
}

export function useCounter(options: UseCounterOptions = {}) {
  const { min, max, initial = 0 } = options;

  const [count, setCount] = useState(initial);

  const increment = useCallback(() => {
    setCount((c) => {
      if (typeof max === "number" && c >= max) return c;
      return c + 1;
    });
  }, [max]);

  const decrement = useCallback(() => {
    setCount((c) => {
      if (typeof min === "number" && c <= min) return c;
      return c - 1;
    });
  }, [min]);

  const reset = useCallback(() => {
    setCount(initial);
  }, [initial]);

  return {
    count,
    increment,
    decrement,
    reset,
  };
}
