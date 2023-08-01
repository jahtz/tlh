const buttonClasses = (color: string): string => `my-2 px-4 py-2 rounded bg-${color}-500 text-white disabled:opacity-50`;

export const blueButtonClasses = buttonClasses('blue');

export const greenButtonClasses = buttonClasses('green');
