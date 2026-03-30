import { useEffect, useRef } from 'preact/hooks';

type UseFocusTrapOptions = {
  dependencies?: unknown[];
  escapeHandler?: () => void;
};

/**
 * Trap focus within a container element.
 * Supports dynamic content by recalculating focusable elements when dependencies change.
 *
 * @param isActive - Whether the focus trap is active
 * @param options - Configuration options
 */
export function useFocusTrap(isActive: boolean, options: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Save the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      return Array.from(
        container.querySelectorAll(focusableSelectors.join(','))
      ) as HTMLElement[];
    };

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      // Set tabindex="-1" on container so it can receive focus
      container.setAttribute('tabindex', '-1');
      container.focus();
      return;
    }

    // Focus the first element
    focusableElements[0].focus();

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      e.preventDefault();

      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) {
        return;
      }

      const currentIndex = currentFocusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      let nextIndex: number;
      if (e.shiftKey) {
        // Shift+Tab: move to previous element, wrap to last if at first
        nextIndex =
          currentIndex <= 0
            ? currentFocusableElements.length - 1
            : currentIndex - 1;
      } else {
        // Tab: move to next element, wrap to first if at last
        nextIndex =
          currentIndex === currentFocusableElements.length - 1
            ? 0
            : currentIndex + 1;
      }

      currentFocusableElements[nextIndex].focus();
    };

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (options.escapeHandler) {
          options.escapeHandler();
        }
      }
    };

    // Add event listeners
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('keydown', handleEscape);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('keydown', handleEscape);

      // Restore focus when trap is deactivated
      if (previousActiveElement.current && document.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, ...(options.dependencies || [])]);

  return containerRef;
}
