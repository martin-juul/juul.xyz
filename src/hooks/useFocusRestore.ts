import { useEffect, useRef } from 'preact/hooks';

/**
 * Restore focus to the element that opened a dialog or window.
 * Uses origin-based tracking to restore focus to the specific element that triggered the action.
 *
 * @param isOpen - Whether the dialog/window is open
 */
export function useFocusRestore(isOpen: boolean) {
  const originElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element as the origin
      originElementRef.current = document.activeElement as HTMLElement;
    } else {
      // Restore focus to the origin element
      if (originElementRef.current && document.contains(originElementRef.current)) {
        originElementRef.current.focus();
      } else {
        // Fallback: find the next focusable element if origin is gone
        const nextFocusable = document.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (nextFocusable) {
          nextFocusable.focus();
        }
      }
    }
  }, [isOpen]);

  return originElementRef;
}

/**
 * Extended version that allows manually setting the origin element.
 * Useful when the opening action is triggered by a non-focus event (e.g., double-click).
 */
export function useFocusRestoreManual() {
  const originElementRef = useRef<HTMLElement | null>(null);

  const setOrigin = (element: HTMLElement | null) => {
    originElementRef.current = element;
  };

  const restore = () => {
    if (originElementRef.current && document.contains(originElementRef.current)) {
      originElementRef.current.focus();
    } else {
      // Fallback: find the next focusable element if origin is gone
      const nextFocusable = document.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (nextFocusable) {
        nextFocusable.focus();
      }
    }
  };

  return {
    setOrigin,
    restore,
    originElement: originElementRef.current,
  };
}
