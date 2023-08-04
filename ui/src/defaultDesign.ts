const buttonClasses = (color: string): string => `my-2 px-4 py-2 rounded bg-${color}-500 text-white disabled:opacity-50`;

export const blueButtonClasses = buttonClasses('blue');

export const greenButtonClasses = buttonClasses('green');


export const defaultInputClasses = 'my-2 p-2 rounded border border-slate-500 w-full';