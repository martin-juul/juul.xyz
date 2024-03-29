import React, { ReactNode } from 'react';
import './modal.css';
import { FormattedMessage } from 'react-intl';

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
export function Modal({title, isOpen, toggle, children}: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="modal modal-box"
          onClick={() => toggle()}>
          <div onClick={(e) => e.stopPropagation()}>
            <h2>{title}</h2>
            {children}

            <div className="button-group">
              <button
                className="mt-1"
                onClick={() => toggle()}
              ><FormattedMessage id="close" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
