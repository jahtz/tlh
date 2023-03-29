import {ChangeEvent} from 'react';


export interface SelectOption<T> {
  value: T;
  label: string;
}

interface CustomSelectProps<T> {
  label: string;
  id: string;
  currentValue: T;
  options: SelectOption<T>[];
  onUpdate: (t: T) => void;
}

export function ObjectSelect<T>({label, id, currentValue, options, onUpdate}: CustomSelectProps<T>): JSX.Element {

  function onValueChange(event: ChangeEvent<HTMLSelectElement>) {
    onUpdate(options[event.target.selectedIndex].value);
  }

  const currentValueLabel = options.find(({value}) => value === currentValue)?.label;

  return (
    <div>
      <label htmlFor={id} className="font-bold">{label}:</label>
      <select id={id} onChange={onValueChange} defaultValue={currentValueLabel} className="mt-2 p-2 rounded bg-white border border-slate-500 w-full">
        {options.map(({/*value,*/ label}, index) =>
          <option key={index}>{label}</option>
        )}
      </select>
    </div>
  );
}
