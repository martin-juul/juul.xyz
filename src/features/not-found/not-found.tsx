import React from 'react';
import { FormattedMessage } from 'react-intl';

export function NotFound() {

  return (
    <>
      <h1><FormattedMessage id="not-found.page.title" /></h1>
      <p><FormattedMessage id="not-found.page.content" /></p>
    </>
  )
}