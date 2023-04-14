import * as React from 'react';
import { ResumeItem as ResumeItemModel } from '../models';
import { Image } from '../../../components/image';

export function ResumeItem({id, title, company, logo, duration, highlights}: ResumeItemModel): JSX.Element {
  return (
    <>
      <a href={'#' + id} style={{ fontSize: '2rem' }}>{title}</a>
      <div className="mt-1 d-flex">
        <Image src={logo} maxWidth={100}/>
        <p className="ml-2" style={{ fontSize: '1.8rem', fontWeight: 600 }}>{company}</p>
      </div>
      <p>{duration.start} - {duration.end}</p>

      {highlights.length > 0 && (
        <ul>
          {highlights.map((highlight, key) => (
            <li key={key}>{highlight}</li>
          ))}
        </ul>
      )}
    </>
  );
}
