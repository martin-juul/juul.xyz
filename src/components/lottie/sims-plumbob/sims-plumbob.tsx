import * as React from 'react';
import Lottie from 'lottie-react';
import simsPlumbobData from './sims-plumbob.json';

export function SimsPlumbob() {

  return <Lottie animationData={simsPlumbobData} loop={true}/>;
}