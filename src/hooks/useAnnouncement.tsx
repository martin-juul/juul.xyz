import { useState, useEffect } from 'preact/hooks';
import { LiveRegion } from '../components/LiveRegion';

/**
 * Hook for managing screen reader announcements.
 * Returns LiveRegion components to render and an announce function.
 *
 * @example
 * const { announce, PoliteRegion, AssertiveRegion } = useAnnouncement();
 *
 * return (
 *   <>
 *     <PoliteRegion />
 *     <AssertiveRegion />
 *     <button onClick={() => announce('Window opened')}>
 *       Open
 *     </button>
 *   </>
 * );
 */
export function useAnnouncement() {
  const [politeMessage, setPoliteMessage] = useState<string>('');
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');

  useEffect(() => {
    const handlePoliteAnnouncement = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setPoliteMessage(customEvent.detail);
    };

    const handleAssertiveAnnouncement = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setAssertiveMessage(customEvent.detail);
    };

    window.addEventListener('announce-polite', handlePoliteAnnouncement);
    window.addEventListener('announce-assertive', handleAssertiveAnnouncement);

    return () => {
      window.removeEventListener('announce-polite', handlePoliteAnnouncement);
      window.removeEventListener('announce-assertive', handleAssertiveAnnouncement);
    };
  }, []);

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    // Import and call the announce function from LiveRegion
    import('../components/LiveRegion').then((module) => {
      module.announce(message, politeness);
    });
  };

  return {
    announce,
    PoliteRegion: () => <LiveRegion politeness="polite" message={politeMessage} />,
    AssertiveRegion: () => <LiveRegion politeness="assertive" message={assertiveMessage} />,
  };
}

/**
 * Convenience hook that only returns the announce function.
 * Use this if you're rendering live regions at a higher level.
 */
export function useAnnounce() {
  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    import('../components/LiveRegion').then((module) => {
      module.announce(message, politeness);
    });
  };

  return { announce };
}
