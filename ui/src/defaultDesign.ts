const borderColors = {
  error: 'border-red-500',
  success: 'border-green-500',
  default: 'border-slate-500'
};

//  Buttons

import classNames from 'classnames';

export const buttonClasses = (color: string): string => `my-2 px-4 py-2 rounded bg-${color}-500 text-white disabled:opacity-50`;

export const amberButtonClasses = buttonClasses('amber');
export const blueButtonClasses = buttonClasses('blue');
export const greenButtonClasses = buttonClasses('green');
export const redButtonClasses = buttonClasses('red');

// Inputs

export const defaultInputClasses = 'my-2 p-2 rounded border border-slate-500 bg-white w-full';

export const inputClasses = (touched: boolean | undefined, errors: string | undefined): string =>
  classNames('mt-2 p-2 rounded border w-full', touched ? (errors ? borderColors.error : borderColors.success) : borderColors.default);

// Messages

const messageClasses = (color: string): string => `my-2 p-4 rounded bg-${color}-500 text-white text-center`;

export const amberMessageClasses = messageClasses('amber');
export const blueMessageClasses = messageClasses('blue');
export const greenMessageClasses = messageClasses('green');
export const redMessageClasses = messageClasses('red');

// Form helpers

export const explTextClasses = 'my-2 italic text-cyan-500';