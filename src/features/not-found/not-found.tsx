import React from 'react';
import { FormattedMessage } from 'react-intl';
import { NotFoundRobot } from '../../components/lottie/not-found-robot';

export function NotFound() {

  return (
    <>
      <h1><FormattedMessage id="not-found.page.title"/></h1>
      <p><FormattedMessage id="not-found.page.content"/></p>

      <NotFoundRobot />
    </>
  );
}