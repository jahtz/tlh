import {XmlElementNode} from '../xmlModel/xmlModel';
import {XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {LineBreakEditor} from '../LineBreakEditor';

export interface LineBreakData {
  textId: string;
  lineNumber: string;
  lg: string | undefined;
}

export function readLineBreakData(node: XmlElementNode): LineBreakData {
  return {
    textId: node.attributes.txtid,
    lineNumber: node.attributes.lnr,
    lg: node.attributes.lg
  };
}

export function writeLineBreakData({textId, lineNumber, lg}: LineBreakData, originalNode: XmlElementNode): XmlElementNode {
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

export function lineBreakNodeConfig(withBr = true): XmlSingleEditableNodeConfig<LineBreakData> {
  return {
    // TODO: only render <br/> if not first linebreak!
    replace: (node, _renderedChildren, path, currentSelectedPath) => {

      const isSelected = !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.');

      return (
        <>
          <span className={classNames('lb', {'has-background-primary': isSelected})}>{withBr && <br/>}{node.attributes.lnr}:</span>
          &nbsp;&nbsp;&nbsp;
        </>
      );
    },
    edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
    readNode: readLineBreakData,
    writeNode: writeLineBreakData,
    insertablePositions: {
      beforeElement: ['lb'],
      asLastChildOf: ['div1']
    }
  };
}