import {ClbEditor} from './ClbEditor';
import {displayReplace, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import update from 'immutability-helper';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export interface ClbData {
  id: string;
}

export const clbNodeConfig: XmlInsertableSingleEditableNodeConfig<ClbData> = {
  // TODO: how to display <clb/> in xml editor?
  replace: (node, _element, isSelected) => displayReplace(
    <>
      <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}</span>&nbsp;
    </>
  ),
  edit: (props) => <ClbEditor {...props}/>,
  readNode: (node): ClbData => ({id: node.attributes.id || ''}),
  writeNode: ({id: newId}, node) => update(node, {attributes: {id: {$set: newId}}}),
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w'],
    newElement: () => ({tagName: 'clb', attributes: {id: 'CLB'}, children: []})
  }
};