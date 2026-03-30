import { useRef, useEffect } from 'preact/hooks';

interface LiveRegionProps {
  politeness?: 'polite' | 'assertive';
  message?: string;
}

/**
 * Visually hidden live region for screen reader announcements.
 * Renders aria-live region with aria-atomic="true" for complete announcements.
 *
 * @param politeness - 'polite' for most announcements, 'assertive' for urgent errors
 * @param message - The message to announce
 */
export function LiveRegion({ politeness = 'polite', message }: LiveRegionProps) {
  const announcementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message && announcementRef.current) {
      // Clear the message first so screen readers announce repeated messages
      announcementRef.current.textContent = '';

      // Use setTimeout to ensure the clear is registered before setting new content
      const timeoutId = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      <p ref={announcementRef} aria-hidden="true">
        {message}
      </p>
    </div>
  );
}

interface AnnouncementQueue {
  message: string;
  politeness: 'polite' | 'assertive';
  timestamp: number;
}

let politeQueue: AnnouncementQueue[] = [];
let assertiveQueue: AnnouncementQueue[] = [];
let politeTimeoutId: number | null = null;
let assertiveTimeoutId: number | null = null;
let isPoliteAnnouncing = false;
let isAssertiveAnnouncing = false;

const DEBOUNCE_MS = 250;
const MAX_QUEUE_SIZE = 5;

/**
 * Announce a message to screen readers via live region.
 * Implements queuing with max 5 items, 250ms debounce, and assertive interrupts polite.
 *
 * @param message - The message to announce
 * @param politeness - 'polite' for most announcements, 'assertive' for urgent errors
 */
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const announcement: AnnouncementQueue = {
    message,
    politeness,
    timestamp: Date.now(),
  };

  if (politeness === 'assertive') {
    // Assertive interrupts any polite announcement
    if (politeTimeoutId !== null) {
      clearTimeout(politeTimeoutId);
      politeTimeoutId = null;
    }
    isPoliteAnnouncing = false;

    // Add to assertive queue
    assertiveQueue.push(announcement);
    if (assertiveQueue.length > MAX_QUEUE_SIZE) {
      assertiveQueue.shift(); // Remove oldest
    }

    // Process assertive queue immediately
    if (!isAssertiveAnnouncing) {
      processAssertiveQueue();
    }
  } else {
    // Add to polite queue
    politeQueue.push(announcement);
    if (politeQueue.length > MAX_QUEUE_SIZE) {
      politeQueue.shift(); // Remove oldest
    }

    // Debounce polite announcements
    if (politeTimeoutId !== null) {
      clearTimeout(politeTimeoutId);
    }

    politeTimeoutId = window.setTimeout(() => {
      if (!isAssertiveAnnouncing) {
        processPoliteQueue();
      }
    }, DEBOUNCE_MS);
  }
}

function processPoliteQueue() {
  if (politeQueue.length === 0 || isAssertiveAnnouncing) {
    isPoliteAnnouncing = false;
    return;
  }

  isPoliteAnnouncing = true;
  const announcement = politeQueue.shift();
  if (announcement) {
    const event = new CustomEvent('announce-polite', {
      detail: announcement.message,
    });
    window.dispatchEvent(event);

    // Continue processing queue
    politeTimeoutId = window.setTimeout(() => {
      processPoliteQueue();
    }, DEBOUNCE_MS);
  }
}

function processAssertiveQueue() {
  if (assertiveQueue.length === 0) {
    isAssertiveAnnouncing = false;
    return;
  }

  isAssertiveAnnouncing = true;
  const announcement = assertiveQueue.shift();
  if (announcement) {
    const event = new CustomEvent<'announce-assertive'>('announce-assertive', {
      detail: announcement.message,
    });
    window.dispatchEvent(event);

    // Continue processing assertive queue
    assertiveTimeoutId = window.setTimeout(() => {
      processAssertiveQueue();
    }, DEBOUNCE_MS);
  }
}
