import { ProjectItemModel } from '../models/project-item-model.ts';

import styles from './project-item.module.scss';

export function ProjectItem({id, name, url, description}: ProjectItemModel): JSX.Element {
  return (
    <div>
      <div className={styles.head}>
        <a href={`#` + id}>{name}</a>

        <a href={url} target="_blank" className={styles.projectLink}>{url}</a>
      </div>

      <p>{description}</p>
    </div>
  );
}
