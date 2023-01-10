import {useState} from 'react';

interface IProps {
  title: string;
  initialValue: string | undefined;
  onFocus: () => void;
  onBlur: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export function WordStringChildEditor({title, initialValue, onFocus, onBlur, onDelete, onCancel, onSubmit}: IProps): JSX.Element {

  const [value, setValue] = useState(initialValue || '');

  return (
    <div className="mt-2 flex">
      <label htmlFor="stringChildInput" className="p-2 rounded-l border-l border-y border-slate-500 bg-slate-100 font-bold">{title}:</label>

      <input type="text" id="stringChildInput" placeholder={title} defaultValue={value} onChange={(event) => setValue(event.target.value)}
             className="p-2 border border-slate-500 flex-grow" onFocus={onFocus} onBlur={onBlur}/>

      <button type="button" className="p-2 border-y border-slate-500 bg-red-600 text-white" onClick={onDelete}>&#128465;</button>

      <button type="button" className="p-2 border-y border-slate-500 bg-yellow-400 text-white" onClick={onCancel}>&#128473;</button>

      <button type="button" className="p-2 rounded-r border-r border-y border-slate-500 bg-blue-500 text-white"
              onClick={() => onSubmit(value)}>&#10003;</button>
    </div>
  );
}