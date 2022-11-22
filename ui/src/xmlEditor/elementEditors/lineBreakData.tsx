import {displayReplace, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {LineBreakEditor} from './LineBreakEditor';
import update from 'immutability-helper';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export interface LineBreakData {
  textId: string;
  lnr: string;
  lg: string | undefined;
}

export const lineBreakNodeConfig: XmlInsertableSingleEditableNodeConfig<LineBreakData> = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'])}>{node.attributes.lnr}:</span>
      &nbsp;&nbsp;&nbsp;
    </>
  ),
  edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
  readNode: (node) => ({
    textId: node.attributes.txtid || '',
    lnr: node.attributes.lnr || '',
    lg: node.attributes.lg
  }),
  writeNode: ({textId, lnr, lg}, originalNode) => update(originalNode, {
    attributes: {
      txtid: {$set: textId},
      lnr: {$set: lnr},
      lg: {$set: lg || ''}
    }
  }),
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  }
};