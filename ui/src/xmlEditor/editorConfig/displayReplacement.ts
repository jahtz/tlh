import {JSX} from 'react';

export interface DisplayReplacement {
  clickablePrior: JSX.Element;
  notClickable: JSX.Element;
  posterior?: JSX.Element;
}

export function displayReplace(clickable: JSX.Element, notClickable: JSX.Element, posterior?: JSX.Element): DisplayReplacement {
  return {clickablePrior: clickable, notClickable, posterior};
}