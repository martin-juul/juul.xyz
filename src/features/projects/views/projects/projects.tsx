import * as React from 'react';
import { useContext, useEffect } from 'react';
import { LanguageContext } from '../../../../context/language';
import { ProjectItemModel } from '../../models';
import { FormattedMessage, useIntl } from 'react-intl';
import posthog from 'posthog-js';
import { getProjects } from '../../services';
import { Helmet } from 'react-helmet-async';
import { ProjectItem } from '../../components/project-item';

export function Projects() {
  const languageContext = useContext(LanguageContext);
  const [items, setItems] = React.useState<ProjectItemModel[]>([]);
  const intl = useIntl();

  useEffect(() => {
    posthog.capture('$pageview');
  }, []);

  useEffect(() => {
    if (languageContext?.language) {
      getProjects(languageContext.language).then(items => {
        setItems(items);
      })
    }
  }, [languageContext?.language]);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{`${intl.formatMessage({id: 'projects'})} | ${intl.formatMessage({id: 'brand'})}`}</title>
      </Helmet>

      <h1 className="mb-3"><FormattedMessage id="projects"/></h1>

      {items.length > 0 && items.map(item => (
        <div
          className="mt-4 project-item"
        >
          <ProjectItem
            id={item.id}
            name={item.name}
            url={item.url}
            description={item.description}
          />
        </div>
      ))}
    </>
  )
}
