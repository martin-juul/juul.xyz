import { useEffect, useRef } from 'preact/hooks';
import Webamp from 'webamp';

type MusicPlayerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MusicPlayer({ isOpen, onClose }: MusicPlayerProps) {
  const webampRef = useRef<Webamp | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
      return;
    }

    if (webampRef.current) return; // Already initialized

    const webamp = new Webamp({
      initialTracks: [
        {
          metaData: {
            artist: "Dj Cammy",
            title: "Celebrate the Summer",
          },
          url: "/music/Dj Cammy - Celebrate the Summer.mp3",
        },
        {
          metaData: {
            artist: "Eisblume",
            title: "Ice flowers HQ",
          },
          url: "/music/Eisblume - Ice flowers HQ.mp3",
        },
        {
          metaData: {
            artist: "Yinglee",
            title: "Your Heart For My Number",
          },
          url: "/music/Yinglee - Your Heart For My Number.mp3",
        },
      ],
      enableHotkeys: true,
      enableMediaSession: true,
      filePickers: [
        {
          contextMenuName: "Add Files...",
          filePicker: async () => {
            return new Promise((resolve) => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "audio/*";
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  const tracks = Array.from(files).map((file) => ({
                    blob: file,
                    metaData: {
                      artist: "Unknown",
                      title: file.name.replace(/\.[^/.]+$/, ""),
                    },
                  }));
                  resolve(tracks);
                } else {
                  resolve([]);
                }
              };
              input.click();
            });
          },
          requiresNetwork: false,
        },
      ],
    });

    webampRef.current = webamp;

    if (containerRef.current) {
      webamp.renderWhenReady(containerRef.current);
    }

    // Handle Webamp close
    webamp.onClose(() => {
      onClose();
    });

    return () => {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style="position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2000; pointer-events: none;"
    />
  );
}
