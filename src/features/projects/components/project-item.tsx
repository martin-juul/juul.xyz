import * as React from 'react';
import { ProjectItemModel } from '../models';

export function ProjectItem({id, name, url, description}: ProjectItemModel): JSX.Element {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <a href={`#` + id}>{name}</a>

        <a href={url} target="_blank" style={{ marginTop: '8px' }}>{url}</a>
      </div>

      <p>{description}</p>
    </>
  );
}
