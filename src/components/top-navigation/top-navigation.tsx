import React from 'react';
import { Link } from 'react-router-dom';
import './top-navigation.css';
import { FormattedMessage } from 'react-intl';

export function TopNavigation() {
  return (
    <ul
      className="top-navigation"
      role="navigation"
    >
      <li><Link to="/"><FormattedMessage id="home" /></Link></li>
      <li><Link to="/resume"><FormattedMessage id="resume" /></Link></li>
      <li><Link to="/projects"><FormattedMessage id="projects" /></Link></li>
      <li><Link to="/contact"><FormattedMessage id="contact" /></Link></li>
    </ul>
  );
}
