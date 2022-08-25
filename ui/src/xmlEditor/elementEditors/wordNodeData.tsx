import {
  isMultiMorphologicalAnalysis,
  MorphologicalAnalysis,
  multiMorphAnalysisIsWithMultiEnclitics,
  readMorphologiesFromNode,
  singleMorphAnalysisIsWithMultiEnclitics,
  writeMorphAnalysisValue
} from '../../model/morphologicalAnalysis';
import {isXmlElementNode, XmlElementNode, XmlNode} from '../../xmlModel/xmlModel';
import {XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {readSelectedMorphology} from '../../model/selectedMorphologicalAnalysis';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export interface WordNodeData {
  node: XmlElementNode;
  lg: string;
  morphologies: MorphologicalAnalysis[];
  footNote?: string;
}

export function readWordNodeData(node: XmlElementNode): WordNodeData {
  const lastChild = node.children[node.children.length - 1];

  const selectedMorphologies = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  const morphologies = readMorphologiesFromNode(node, selectedMorphologies);

  return {
    node: node,
    lg: node.attributes.lg || '',
    morphologies,
    footNote: lastChild && isXmlElementNode(lastChild) && lastChild.tagName === 'note'
      ? lastChild.attributes.c
      : undefined,
  };
}

function addFootNote(children: XmlNode[], footNote: string): XmlNode[] {
  const lastElement = children[children.length - 1];

  const newElement = {tagName: 'note', attributes: {c: footNote}, children: []};

  return isXmlElementNode(lastElement) && lastElement.tagName === 'note'
    ? [...children.slice(0, -1), newElement]
    : [...children, newElement];
}

function removeFootNote(children: XmlNode[]): XmlNode[] {
  const lastElement: XmlNode | undefined = children[children.length - 1];

  return lastElement && isXmlElementNode(lastElement) && lastElement.tagName === 'note'
    ? children.slice(0, -1)
    : children;
}

export function writeWordNodeData({node: originalNode, lg, morphologies, footNote}: WordNodeData): XmlElementNode {
  const {tagName, attributes, children: originalChildren} = originalNode;

  const children = footNote
    ? addFootNote(originalChildren, footNote)
    : removeFootNote(originalChildren);

  const node: XmlElementNode = {
    tagName,
    attributes: {...attributes, lg},
    children
  };

  for (const ma of morphologies) {
    node.attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
  }

  const selectedAnalysisOptions: string[] = morphologies.flatMap((ma) => {

    if (isMultiMorphologicalAnalysis(ma)) {
      if (multiMorphAnalysisIsWithMultiEnclitics(ma)) {
        // FIXME!
        return ma.selectedAnalysisCombinations.map(({number, morphLetter, encLetter}) => `${number}${morphLetter}${encLetter}`);
      } else {
        return ma.analysisOptions
          .filter(({selected}) => selected)
          .map(({letter}) => `${ma.number}${letter}`);
      }
    } else {
      if (singleMorphAnalysisIsWithMultiEnclitics(ma)) {
        return ma.encliticsAnalysis.analysisOptions
          .filter(({selected}) => selected)
          .map(({letter}) => `${ma.number}${letter}`);
      } else {
        return ma.number.toString();
      }
    }
  });

  if (selectedAnalysisOptions.length > 0) {
    node.attributes.mrp0sel = selectedAnalysisOptions.length > 0
      ? selectedAnalysisOptions.join(' ')
      : ' ';
  }


  return node;
}

const foreignLanguageColors: { [key: string]: string } = {
  HURR: 'Hur',
  HATT: 'Hat',
  // PAL: '',
  LUW: 'Luw'
};

function isOnlySpaces({children}: XmlElementNode): boolean {
  return children.length === 1 && isXmlElementNode(children[0]) && children[0].tagName === 'space';
}

export const wordNodeConfig: XmlInsertableSingleEditableNodeConfig<WordNodeData> = {
  replace: (node, renderedChildren, isSelected) => {

    const notMarked = node.attributes.mrp0sel === 'DEL';

    const isForeignLanguage = Object.keys(foreignLanguageColors).includes(node.attributes.mrp0sel);

    const needsMorphology = !!node.attributes.mrp0sel;
    const hasNoMorphologySelected = needsMorphology && node.attributes.mrp0sel.trim().length === 0 || node.attributes.mrp0sel === '???';

    const hasMorphAnalyses = Object.keys(node.attributes)
      .filter((name) => name.startsWith('mrp') && !name.startsWith('mrp0'))
      .length > 0;

    const hasEditingQuestion = !!node.attributes.editingQuestion;

    // FIXME: colors / classes!

    const classes = classNames(node.attributes.lg || '',
      isOnlySpaces(node)
        ? [isSelected ? selectedNodeClass : 'bg-gray-200']
        : {
          'has-background-warning': !notMarked && !isForeignLanguage && needsMorphology && !hasMorphAnalyses,
          [foreignLanguageColors[node.attributes.mrp0sel]]: isForeignLanguage,
          'has-text-weight-bold': isForeignLanguage,
          'text-red-600': node.children.length === 0,
          'bg-yellow-300': !isSelected && !notMarked && hasNoMorphologySelected,
          // TODO: backgrounds...
          'bg-blue-300': hasEditingQuestion,
          [selectedNodeClass]: isSelected,
        });

    return <>
        <span className={classes} title={hasEditingQuestion ? node.attributes.q : undefined}>
          {node.children.length === 0 ? <span>&#x2715;</span> : renderedChildren}
        </span>
      &nbsp;&nbsp;
    </>;
  },
  edit: (props) => isOnlySpaces(props.data.node)
    ? <SpacesEditor {...props}/>
    : <WordNodeEditor key={props.path.join('.')} {...props}/>,
  readNode: readWordNodeData,
  writeNode: writeWordNodeData,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  }
};