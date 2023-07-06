import {isXmlElementNode, XmlElementNode} from 'simple_xml';
import {XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {JSX, ReactElement} from 'react';

const isOnlySpaces = ({children}: XmlElementNode): boolean => children.length === 1 && isXmlElementNode(children[0]) && children[0].tagName === 'space';

function backgroundColor(node: XmlElementNode, isSelected: boolean, selectedMorphology: string | undefined): string | undefined {
  // Prio 1: current selection
  if (isSelected) {
    return selectedNodeClass;
  }

  // Prio 2: has editing question
  if (node.attributes.editingQuestion !== undefined) {
    return 'bg-blue-300';
  }

  // Prio 3: has no morphology selected
  if (selectedMorphology !== undefined && selectedMorphology.length === 0 && selectedMorphology !== '???' && selectedMorphology !== 'DEL') {
    return 'bg-yellow-300';
  }

  return undefined;
}

export const replaceWordDisplay = (node: XmlElementNode<'w'>, renderChildren: () => JSX.Element, isSelected: boolean): ReactElement => {

  const selectedMorph = node.attributes.mrp0sel?.trim();

  // FIXME: add <lb/>.lg and <text/>.lg!
  const languageClass = node.attributes.lg || '';

  const classes = classNames(node.attributes.lg || '',
    isOnlySpaces(node)
      ? [isSelected ? selectedNodeClass : 'bg-gray-200']
      : [
        backgroundColor(node, isSelected, selectedMorph),
        languageClass,
        {'text-red-600': node.children.length === 0,}
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
  edit: (props) => isOnlySpaces(props.node)
    ? <SpacesEditor {...props}/>
    : <WordNodeEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asFirstChildOf: ['devi'],
    asLastChildOf: ['div1', 'cl', 'devi']
  }
};