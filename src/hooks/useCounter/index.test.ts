import { renderHook, act } from "@testing-library/react-hooks";
import { describe, it, expect } from "vitest";
import { useCounter } from "./index";

describe("useCounter", () => {
  it("should increment counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should decrement counter", () => {
    const { result } = renderHook(() => useCounter({ initial: 5 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
