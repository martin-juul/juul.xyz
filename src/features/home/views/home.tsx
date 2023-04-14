import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Image } from '../../../components/image';
import { SimsPlumbob } from '../../../components/lottie/sims-plumbob';

export function Home() {
  const intl = useIntl();

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{`${intl.formatMessage({ id: 'brand' })}`}</title>
      </Helmet>

      <h1><FormattedMessage id="home.page.title" /></h1>
      <h2><FormattedMessage id="home.page.subtitle" /></h2>
      <hr/>
      <h3><FormattedMessage id="home.page.byline" /></h3>

      <div className="d-flex justify-between" style={{marginTop: '4vh'}}>
        <h2 className="mt-1"><FormattedMessage id="who" />?</h2>


        <div className="d-flex relative">
          <div className="absolute" style={{ top: -40, left: 60 }}>
            <SimsPlumbob />
          </div>

          <Image
            src="https://media.licdn.com/dms/image/C4D03AQHYGjOsNrWZDw/profile-displayphoto-shrink_400_400/0/1623166551911?e=1686182400&v=beta&t=5kU8h4RD9GYJ5JiiSjKXQdLcx9uCblR2Qw9GdWh5f8Y"
            maxWidth={150}
          />
        </div>
      </div>

      <p>
        <FormattedMessage id="home.page.content" />
      </p>
    </>
  );
}
