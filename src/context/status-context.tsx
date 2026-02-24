import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';

type StatusContextType = {
  statusText: string;
  setStatusText: (text: string) => void;
};

const StatusContext = createContext<StatusContextType>({
  statusText: '',
  setStatusText: () => {},
});

export function useStatus() {
  return useContext(StatusContext);
}

export function StatusProvider({ children }: { children: preact.ComponentChild }) {
  const [statusText, setStatusText] = useState('');

  return (
    <StatusContext.Provider value={{ statusText, setStatusText }}>
      {children}
    </StatusContext.Provider>
  );
}

// Hook for pages to set status - auto-clears on unmount
export function useSetStatus(text: string) {
  const { setStatusText } = useStatus();

  useEffect(() => {
    setStatusText(text);
    return () => setStatusText('');
  }, [text, setStatusText]);
}
