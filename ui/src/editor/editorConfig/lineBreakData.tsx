import {XmlElementNode} from '../xmlModel/xmlModel';
import {XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {LineBreakEditor} from '../LineBreakEditor';

export interface LineBreakData {
  textId: string;
  lineNumber: string;
  lg: string | undefined;
}

function readLineBreakData(node: XmlElementNode): LineBreakData {
  return {
    textId: node.attributes.txtid,
    lineNumber: node.attributes.lnr,
    lg: node.attributes.lg
  };
}

function writeLineBreakData({textId, lineNumber, lg}: LineBreakData, originalNode: XmlElementNode): XmlElementNode {
  return {
    ...originalNode,
    attributes: {
      ...originalNode.attributes,
      txtid: textId,
      lnr: lineNumber,
      lg: lg || ''
    }
  };
}

export const lineBreakNodeConfig: XmlSingleEditableNodeConfig<LineBreakData> = {
  replace: (node, _renderedChildren, path, currentSelectedPath) => {

    const isSelected = !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.');

    return (
      <>
        <span className={classNames('lb', {'has-background-primary': isSelected})}><br/>{node.attributes.lnr}:</span>
        &nbsp;&nbsp;&nbsp;
      </>
    );
  },
  edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
  readNode: readLineBreakData,
  writeNode: writeLineBreakData,
  insertablePositions: {
    beforeElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  }
};