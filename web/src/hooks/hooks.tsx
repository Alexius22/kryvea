import { RefObject, useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}

export function scrollElementHorizontally(reactRef: RefObject<HTMLElement>) {
  return () => {
    if (!reactRef.current) {
      return;
    }

    // When user scroll wheel it converts to horizontal scroll
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      reactRef.current.scrollLeft += event.deltaY;
    };

    reactRef.current.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (!reactRef.current) {
        return;
      }

      reactRef.current.removeEventListener("wheel", handleWheel);
    };
  };
}

type Key = string;

/**
 * Binds a callback to a keyboard shortcut.
 * @param keys - Example: ["Control", "R"] for Ctrl+R
 * @param callback - Function to call on shortcut
 */
export function useKeyboardShortcut(keys: Key[], callback: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressedKeys = [
        e.ctrlKey && "Control",
        e.altKey && "Alt",
        e.shiftKey && "Shift",
        e.metaKey && "Meta",
        e.key.toUpperCase(), // normalize to uppercase
      ].filter(Boolean) as string[];

      // Compare ignoring order
      if (keys.map(k => k.toUpperCase()).every(k => pressedKeys.includes(k))) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys.join("+"), callback]);
}
