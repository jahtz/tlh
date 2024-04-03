import {JSX, useState} from 'react';
import { footNoteTypes, convertToAbbreviation } from '../../model/data/FootNoteType';

interface IProps {
  title: string;
  initialValue: string | undefined;
  onFocus: () => void;
  onBlur: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void;
  isFootNote?: boolean;
}

export function WordStringChildEditor({title, initialValue, onFocus, onBlur, onDelete, onCancel, onSubmit, isFootNote}: IProps): JSX.Element {

  const [value, setValue] = useState(initialValue || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue: string = event.target.value;
    if (newValue.startsWith('<')) {
        setShowDropdown(true);
        setValue(newValue);
    } else {
        setShowDropdown(false);
        setValue(newValue);
    }
  };

  return (
    <div className="mt-2 flex">
      <label htmlFor="stringChildInput" className="p-2 rounded-l border-l border-y border-slate-500 bg-slate-100 font-bold">{title}:</label>

      <input type="text" id="stringChildInput" placeholder={title} defaultValue={value} onChange={handleInputChange}
             className="p-2 border border-slate-500 flex-grow" onFocus={onFocus} onBlur={onBlur} list={isFootNote ? "footnotes" : undefined}/>

      {isFootNote && showDropdown && (
        <datalist id="footnotes">
          {Object.values(footNoteTypes()).map((footNote) => (
            <option key={footNote} value={footNote}>{convertToAbbreviation(footNote.replace('<', ''))}</option>
          ))}
        </datalist>
      )}

      <button type="button" className="p-2 border-y border-slate-500 bg-red-600 text-white" onClick={onDelete}>&#128465;</button>

      <button type="button" className="p-2 border-y border-slate-500 bg-yellow-400 text-white" onClick={onCancel}>&#128473;</button>

      <button type="button" className="p-2 rounded-r border-r border-y border-slate-500 bg-blue-500 text-white"
              onClick={() => onSubmit(value)}>&#10003;</button>
    </div>
  );
}