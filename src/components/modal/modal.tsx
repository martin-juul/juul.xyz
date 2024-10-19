import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import styles from './modal.module.scss';

interface Props {
  title: string;
  isOpen: boolean;
  toggle: () => void;
  children?: ReactNode;
}

/**
 * As of now the modal component has its own dismiss button.
 * This works well since the only consumer is very simple.
 * Care must be taken if more advanced consumers in the future needs more advanced use cases.
 * E.g. multiple buttons like OK | Cancel.
 */
export function Modal({ title, isOpen, toggle, children }: Props) {
  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={'modal ' + styles.modalBox}
          onClick={() => toggle()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <h2>{title}</h2>
            {children}

            <div className="button-group">
              <button
                className="mt-1"
                onClick={() => toggle()}
              ><FormattedMessage id="close"/></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
