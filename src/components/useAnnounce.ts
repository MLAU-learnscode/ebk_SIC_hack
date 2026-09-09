import { useEffect, useRef } from 'react';

/**
 * Move focus to the screen's heading whenever the screen changes.
 *
 * Without this, a screen-reader user presses "Continue", the whole view swaps,
 * and their cursor is left on a button that no longer exists — they hear
 * nothing and have to hunt for where they are. This is the single most
 * important accessibility behaviour in a one-question-per-screen flow, and it
 * is invisible to sighted users, which is exactly why it gets forgotten.
 */
export function useFocusHeading<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [key]);
  return ref;
}
