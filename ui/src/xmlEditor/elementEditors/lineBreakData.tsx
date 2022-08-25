import {XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {LineBreakEditor} from './LineBreakEditor';
import update from 'immutability-helper';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export interface LineBreakData {
  textId: string;
  lineNumber: string;
  lg: string | undefined;
}

export const lineBreakNodeConfig: XmlInsertableSingleEditableNodeConfig<LineBreakData> = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => (
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'])}>{node.attributes.lnr}:</span>
      &nbsp;&nbsp;&nbsp;
    </>
  ),
  edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
  readNode: (node) => ({
    textId: node.attributes.txtid || '',
    lineNumber: node.attributes.lnr || '',
    lg: node.attributes.lg
  }),
  writeNode: ({textId, lineNumber, lg}, originalNode) => update(originalNode, {
    attributes: {
      txtid: {$set: textId},
      lnr: {$set: lineNumber},
      lg: {$set: lg || ''}
    }
  }),
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  }
};