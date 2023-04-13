import React from 'react';
import { Image } from '../../../components/image/image';
import { FormattedMessage } from 'react-intl';

export function Home() {
  return (
    <>
      <h1><FormattedMessage id="home.page.title" /></h1>
      <h2><FormattedMessage id="home.page.subtitle" /></h2>
      <hr/>
      <h3><FormattedMessage id="home.page.byline" /></h3>

      <div className="d-flex justify-between" style={{marginTop: '12vh'}}>
        <h2 className="mt-1"><FormattedMessage id="who" />?</h2>
        <Image
          src="https://media.licdn.com/dms/image/C4D03AQHYGjOsNrWZDw/profile-displayphoto-shrink_400_400/0/1623166551911?e=1686182400&v=beta&t=5kU8h4RD9GYJ5JiiSjKXQdLcx9uCblR2Qw9GdWh5f8Y"
          maxWidth={200}
        />
      </div>

      <p>
        <FormattedMessage id="home.page.content" />
      </p>
    </>
  );
}