import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import './resume.css';
import { ResumeItem as ResumeItemModel } from '../../models/resume.ts';
import { getResume } from '../../services/get-resume';
import { ResumeItem } from '../../components/resume-item';
import { Helmet } from 'react-helmet-async';
import posthog from 'posthog-js';
import { useLanguage } from '../../../../context/language-context.tsx';

export function Resume() {
  const languageContext = useLanguage();
  const [items, setItems] = useState<ResumeItemModel[]>([]);
  const intl = useIntl();

  useEffect(() => {
    posthog.capture('$pageview');
  }, []);

  useEffect(() => {
    getResume(languageContext.language).then(items => {
      setItems(items);
    });
  }, [languageContext.language]);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{`${intl.formatMessage({ id: 'resume' })} | ${ intl.formatMessage({id: 'brand'}) }`}</title>
      </Helmet>

      <h1 className="mb-3"><FormattedMessage id="resume"/></h1>

      {items.length > 0 && items.map(item => (
        <div
          className="mt-4 resume-item"
          key={item.id}
        >
          <ResumeItem
            id={item.id}
            title={item.title}
            company={item.company}
            logo={item.logo}
            duration={item.duration}
            highlights={item.highlights}
          />
        </div>
      ))}
    </>
  );
}
