import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { ResumeItem as ResumeItemModel } from '../../models';
import { LanguageContext } from '../../../../context/language';
import { getResume } from '../../services/get-resume';
import { ResumeItem } from '../../components/resume-item';

export function Resume() {
  const languageContext = useContext(LanguageContext);
  const [items, setItems] = useState<ResumeItemModel[]>([]);

  useEffect(() => {
    if (languageContext?.language) {
      getResume(languageContext.language).then(items => {
        setItems(items);
      });
    }
  }, [languageContext?.language]);

  return (
    <>
      <h1 className="mb-3"><FormattedMessage id="resume"/></h1>

      {items.length > 0 && items.map(item => (
        <ResumeItem
          key={item.id}
          id={item.id}
          title={item.title}
          company={item.company}
          logo={item.logo}
          duration={item.duration}
          highlights={item.highlights}
        />
      ))}
    </>
  );
}