import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children?: ReactNode;
}

export function Portal({ children }: PortalProps) {
  const contents = createPortal(<>{children}</>, document.body);

  return (
    <>
      {contents}
    </>
  );
}
