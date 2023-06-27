import {ReactElement} from 'react';
import {AoJoinNode} from './AoManuscriptsEditor';

export type AoJoinTypes = 'AO:DirectJoin' | 'AO:InDirectJoin';
export const joinTypes: AoJoinTypes[] = ['AO:DirectJoin', 'AO:InDirectJoin'];

interface IProps {
  node: AoJoinNode;
  updateType: (newValue: AoJoinTypes) => void;
}

function stringifyJoinType(joinType: AoJoinTypes): string {
  return {
    'AO:DirectJoin': '+',
    'AO:InDirectJoin': '(+)'
  }[joinType];
}

export function AoJoinEditor({node, updateType}: IProps): ReactElement {
  return (
    <select defaultValue={node.tagName} className="p-2 rounded-l border-l border-y border-slate-500 bg-white flex-grow"
            onChange={(event) => updateType(event.target.value as AoJoinTypes)}>
      {joinTypes.map((joinType) => <option key={joinType} value={joinType}>{stringifyJoinType(joinType)}</option>)}
    </select>
  );
}