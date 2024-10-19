import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { SimsPlumbob } from '@/components/lottie/sims-plumbob/sims-plumbob.tsx';
import { Image } from '@/components/image/image.tsx';


export function Home() {
  const intl = useIntl();
  const imageUrl = new URL('../../../assets/avatar.jpg', import.meta.url);

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
            src={imageUrl.toString()}
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
