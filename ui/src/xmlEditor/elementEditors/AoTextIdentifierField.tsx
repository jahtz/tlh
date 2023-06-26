import {ChangeEvent, JSX} from 'react';
import {AoSource, SourceType, sourceTypes} from './AoManuscriptsEditor';

interface IProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

export function AoTextIdentifierField({source: {type, name}, updateType, updateText}: IProps): JSX.Element {

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => updateType(event.target.value as SourceType);

  return (
    <>
      <select defaultValue={type} className="p-2 rounded-l border-l border-y border-slate-500 bg-gray-100" onChange={onChange}>
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name} onChange={(event) => updateText(event.target.value)}/>
    </>
  );
}
