import {isXmlElementNode, XmlElementNode} from 'simple_xml';
import {displayReplace, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

const foreignLanguageColors: { [key: string]: string } = {
  // FIXME: other colors!
  HURR: 'Hur',
  HATT: 'Hat',
  // PAL: '',
  LUW: 'Luw'
};

function isOnlySpaces({children}: XmlElementNode): boolean {
  return children.length === 1 && isXmlElementNode(children[0]) && children[0].tagName === 'space';
}

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

export const wordNodeConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, renderedChildren, isSelected) => {

    const selectedMorph = node.attributes.mrp0sel?.trim();

    const isForeignLanguage = selectedMorph !== undefined
      ? Object.keys(foreignLanguageColors).includes(selectedMorph)
      : false;

    const hasEditingQuestion = node.attributes.editingQuestion !== undefined;

    const classes = classNames(node.attributes.lg || '',
      isOnlySpaces(node)
        ? [isSelected ? selectedNodeClass : 'bg-gray-200']
        : [
          backgroundColor(node, isSelected, selectedMorph),
          {
            'text-red-600': node.children.length === 0,
            'font-bold': isForeignLanguage,
            [foreignLanguageColors[node.attributes.mrp0sel || '']]: isForeignLanguage,
          }
        ]
    );

    return displayReplace(
      <>
        &nbsp;
        <span className={classes} title={hasEditingQuestion ? node.attributes.q : undefined}>
          {node.children.length === 0 ? <span>&#x2715;</span> : renderedChildren}
        </span>
        &nbsp;
      </>
    );
  },
  edit: (props) => isOnlySpaces(props.node)
    ? <SpacesEditor {...props}/>
    : <WordNodeEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1', 'cl']
  }
};