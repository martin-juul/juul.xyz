import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import styles from './top-navigation.module.scss'

export function TopNavigation() {
  return (
    <menu
      className={styles.topNavigation}
      role="navigation"
    >
      <li className={styles.li}>
        <Link to="/"><FormattedMessage id="home" /></Link>
      </li>
      <li className={styles.li}>
        <Link to="/resume"><FormattedMessage id="resume" /></Link>
      </li>
      <li className={styles.li}>
        <Link to="/projects"><FormattedMessage id="projects" /></Link>
      </li>
      <li className={styles.li}>
        <Link to="/contact"><FormattedMessage id="contact" /></Link>
      </li>
    </menu>
  );
}
