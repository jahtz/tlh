//  Buttons

import classNames from 'classnames';

export const coloredButtonClasses = (color: string): string => `my-2 px-4 py-2 rounded bg-${color}-500 text-white disabled:opacity-50`;

export const amberButtonClasses = coloredButtonClasses('amber');
export const blueButtonClasses = coloredButtonClasses('blue');
export const greenButtonClasses = coloredButtonClasses('green');
export const redButtonClasses = coloredButtonClasses('red');
export const whiteButtonClasses = 'my-2 px-4 py-2 rounded border border-slate-500 bg-white disabled:opacity-50';

// Inputs

export const defaultInputClasses = 'my-2 p-2 rounded border border-slate-500 bg-white w-full';

export const inputClasses = (touched: boolean, errors: boolean): string =>
  classNames('mt-2 p-2 rounded border w-full', touched ? (errors ? 'border-red-500' : 'border-green-500') : 'border-slate-500');

// Messages

const messageClasses = (color: string): string => `my-2 p-4 rounded bg-${color}-500 text-white text-center`;

export const amberMessageClasses = messageClasses('amber');
export const blueMessageClasses = messageClasses('blue');
export const greenMessageClasses = messageClasses('green');
export const redMessageClasses = messageClasses('red');

// Form helpers

export const explTextClasses = 'my-2 italic text-cyan-500';