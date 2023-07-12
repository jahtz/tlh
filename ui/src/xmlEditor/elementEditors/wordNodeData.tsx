import {isXmlElementNode, XmlElementNode} from 'simple_xml';
import {XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {JSX, ReactElement} from 'react';

const isOnlySpaces = ({children}: XmlElementNode): boolean => children.length === 1 && isXmlElementNode(children[0]) && children[0].tagName === 'space';

function backgroundColor(node: XmlElementNode, isSelected: boolean, selectedMorphology: string | undefined): string | undefined {
  if (isSelected) { // Prio 1: current selection
    return selectedNodeClass;
  }

  if (node.attributes.editingQuestion !== undefined) { // Prio 2: has editing question
    return 'bg-blue-300';
  }

  if (selectedMorphology !== undefined && selectedMorphology.length === 0 && selectedMorphology !== '???' && selectedMorphology !== 'DEL') {
    // Prio 3: has no morphology selected
    return 'bg-yellow-300';
  }

  return undefined;
}

const replaceWordDisplay = (node: XmlElementNode<'w'>, renderChildren: () => JSX.Element, isSelected: boolean/*, isLeftSide: boolean*/): ReactElement => {

  // FIXME: add <lb/>.lg and <text/>.lg!
  const languageClass = node.attributes.lg || '';

  const classes = classNames(
    languageClass,
    isOnlySpaces(node)
      ? [isSelected ? selectedNodeClass : 'bg-gray-200']
      : [
        backgroundColor(node, isSelected, node.attributes.mrp0sel?.trim()),
        {'text-red-600': node.children.length === 0}
      ]
  );

  return (
    <>
      &nbsp;
      <span className={classes} title={node.attributes.editingQuestion}>
        {node.children.length === 0 ? <span>&#x2715;</span> : renderChildren()}
      </span>
      &nbsp;
    </>
  );
};

export const wordNodeConfig: XmlSingleInsertableEditableNodeConfig<'w'> = {
  replace: replaceWordDisplay,
  edit: (props) =>
    isOnlySpaces(props.node)
      ? <SpacesEditor {...props}/>
      : <WordNodeEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asFirstChildOf: ['devi'],
    asLastChildOf: ['div1', 'cl', 'devi']
  }
};