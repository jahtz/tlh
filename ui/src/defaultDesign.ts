//  Buttons

export const buttonClasses = (color: string): string => `my-2 px-4 py-2 rounded bg-${color}-500 text-white disabled:opacity-50`;

export const amberButtonClasses = buttonClasses('amber');
export const blueButtonClasses = buttonClasses('blue');
export const greenButtonClasses = buttonClasses('green');
export const redButtonClasses = buttonClasses('red');

// Inputs

export const defaultInputClasses = 'my-2 p-2 rounded border border-slate-500 bg-white w-full';

// Messages

const messageClasses = (color: string): string => `my-2 p-2 rounded bg-${color}-600 text-white text-center`;

export const blueMessageClasses = messageClasses('blue');
export const greenMessageClasses = messageClasses('green');
export const redMessageClasses = messageClasses('red');
