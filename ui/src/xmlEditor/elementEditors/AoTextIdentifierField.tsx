import {ChangeEvent, JSX} from 'react';
import {SourceType, sourceTypes} from './AoManuscriptsEditor';
import {XmlElementNode, XmlTextNode} from 'simple_xml';

interface IProps {
  source: XmlElementNode;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

export function AoTextIdentifierField({source, updateType, updateText}: IProps): JSX.Element {

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => updateType(event.target.value as SourceType);

  const name = (source.children[0] as XmlTextNode).textContent;

  return (
    <>
      <select defaultValue={source.tagName} className="p-2 rounded-l border-l border-y border-slate-500 bg-gray-100" onChange={onChange}>
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name} onChange={(event) => updateText(event.target.value)}/>
    </>
  );
}
