import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { NotFoundRobot } from '../../components/lottie/not-found-robot';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet-async';

export function NotFound() {

  useEffect(() => {
    posthog.capture('$pageview');
  }, []);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1><FormattedMessage id="not-found.page.title"/></h1>
      <p><FormattedMessage id="not-found.page.content"/></p>

      <NotFoundRobot />
    </>
  );
}
