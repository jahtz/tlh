import {ReactElement} from 'react';
import {XmlElementNode, XmlTextNode} from 'simple_xml';
import {useTranslation} from 'react-i18next';
import {Spec} from 'immutability-helper';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';
export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

export type TextIdentifierNode = XmlElementNode<SourceType, 'nr' | 'joinGroup'>;

interface IProps {
  source: TextIdentifierNode;
  updateNode: (spec: Spec<XmlElementNode>) => void;
}

const selectClasses = 'p-2 rounded-l border-l border-y border-slate-500 bg-gray-100';

export function AoTextIdentifierField({source, updateNode}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const name = (source.children[0] as XmlTextNode).textContent;
  const {nr, joinGroup} = source.attributes;

  return (
    <>
      <select defaultValue={source.tagName} className={selectClasses} onChange={(event) => updateNode({tagName: {$set: event.target.value as SourceType}})}>
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name}
             onChange={(event) => updateNode({children: {0: {textContent: {$set: event.target.value}}}})}/>
      <input type="text" className="p-2 border-y border-slate-500" defaultValue={nr} placeholder={t('fragmentIdentifier')}
             onChange={(event) => updateNode({attributes: {nr: {$set: event.target.value}}})}/>
      <input type="text" className="p-2 border-l border-y border-slate-500" defaultValue={joinGroup} placeholder={t('joinGroup')}
             onChange={(event) => updateNode({attributes: {joinGroup: {$set: event.target.value}}})}/>
    </>
  );
}
