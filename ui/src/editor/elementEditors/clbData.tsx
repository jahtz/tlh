import {ClbEditor} from './ClbEditor';
import {XmlInsertableSingleEditableNodeConfig} from '../editorConfig/editorConfig';
import update from 'immutability-helper';
import classNames from 'classnames';
import {selectedNodeClass} from '../editorConfig/tlhXmlEditorConfig';

export interface ClbData {
  id: string;
}

export const clbNodeConfig: XmlInsertableSingleEditableNodeConfig<ClbData> = {
  // TODO: how to display <clb/> in xml editor?
  replace: (node, _element, isSelected) => <span>
    <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}</span>&nbsp;
  </span>,
  edit: (props) => <ClbEditor {...props}/>,
  readNode: (node): ClbData => ({id: node.attributes.id || ''}),
  writeNode: ({id: newId}, node) => update(node, {attributes: {id: {$set: newId}}}),
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w']
  }
};