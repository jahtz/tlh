import {
  isMultiMorphologicalAnalysis,
  MorphologicalAnalysis,
  multiMorphAnalysisIsWithoutEnclitics,
  multiMorphAnalysisIsWithSingleEnclitics,
  MultiMorphologicalAnalysisWithMultiEnclitics,
  MultiMorphologicalAnalysisWithoutEnclitics,
  MultiMorphologicalAnalysisWithSingleEnclitics,
  readMorphologiesFromNode,
  singleMorphAnalysisIsWithoutEnclitics,
  singleMorphAnalysisIsWithSingleEnclitics,
  SingleMorphologicalAnalysisWithMultiEnclitics,
  SingleMorphologicalAnalysisWithoutEnclitics,
  SingleMorphologicalAnalysisWithSingleEnclitics,
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


export function extractSelMorphAnalysesFromSingleMorphWithoutEnc({selected, number}: SingleMorphologicalAnalysisWithoutEnclitics): string[] {
  return selected ? [number.toString()] : [];
}

export function extractSelMorphAnalysesFromSingleMorphWithSingleEnc({selected, number}: SingleMorphologicalAnalysisWithSingleEnclitics): string[] {
  return selected ? [number.toString()] : [];
}

export function extractSelMorphAnalysesFromSingleMorphWithMultiEnc({
  number,
  encliticsAnalysis: {analysisOptions}
}: SingleMorphologicalAnalysisWithMultiEnclitics): string[] {
  return analysisOptions.filter(({selected}) => selected).map(({letter}) => `${number}${letter}`);
}

export function extractSelMorphAnalysesFromMultiMorphWithoutEnc({number, analysisOptions}: MultiMorphologicalAnalysisWithoutEnclitics): string[] {
  return analysisOptions.filter(({selected}) => selected).map(({letter}) => `${number}${letter}`);
}

export function extractSelMorphAnalysesFromMultiMorphWithSingleEnc({number, analysisOptions}: MultiMorphologicalAnalysisWithSingleEnclitics): string[] {
  return analysisOptions.filter(({selected}) => selected).map(({letter}) => `${number}${letter}`);
}

export function extractSelMorphAnalysesFromMultiMorphWithMultiEnc({
  number,
  selectedAnalysisCombinations
}: MultiMorphologicalAnalysisWithMultiEnclitics): string[] {
  return selectedAnalysisCombinations.map(({morphLetter, encLetter}) => `${number}${morphLetter}${encLetter}`);
}

function extractSelectedMorphologicalAnalyses(ma: MorphologicalAnalysis): string[] {
  if (isMultiMorphologicalAnalysis(ma)) {
    if (multiMorphAnalysisIsWithoutEnclitics(ma)) {
      return extractSelMorphAnalysesFromMultiMorphWithoutEnc(ma);
    } else if (multiMorphAnalysisIsWithSingleEnclitics(ma)) {
      return extractSelMorphAnalysesFromMultiMorphWithSingleEnc(ma);
    } else {
      return extractSelMorphAnalysesFromMultiMorphWithMultiEnc(ma);
    }
  } else {
    if (singleMorphAnalysisIsWithoutEnclitics(ma)) {
      return extractSelMorphAnalysesFromSingleMorphWithoutEnc(ma);
    } else if (singleMorphAnalysisIsWithSingleEnclitics(ma)) {
      return extractSelMorphAnalysesFromSingleMorphWithSingleEnc(ma);
    } else {
      return extractSelMorphAnalysesFromSingleMorphWithMultiEnc(ma);
    }
  }
}

export function writeWordNodeData({node: originalNode, lg, morphologies, footNote}: WordNodeData): XmlElementNode {
  const {tagName, attributes, children: originalChildren} = originalNode;

  const children = footNote
    ? addFootNote(originalChildren, footNote)
    : removeFootNote(originalChildren);

  const {trans, mrp0sel, ...rest} = attributes;

  const node: XmlElementNode = {
    tagName,
    attributes: {trans, mrp0sel, ...rest, lg},
    children
  };

  for (const ma of morphologies) {
    node.attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
  }

  const selectedAnalysisOptions: string[] = morphologies.flatMap(extractSelectedMorphologicalAnalyses);

  node.attributes.mrp0sel = selectedAnalysisOptions.length > 0
    ? selectedAnalysisOptions.join(' ')
    : undefined;

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

    const selectedMorph = node.attributes.mrp0sel;

    const notMarked = selectedMorph === 'DEL';

    const isForeignLanguage = selectedMorph !== undefined
      ? Object.keys(foreignLanguageColors).includes(selectedMorph)
      : false;

    const needsMorphology = selectedMorph === undefined || selectedMorph.trim().length === 0;

    const hasNoMorphologySelected = needsMorphology && selectedMorph !== '???';

    const hasMorphAnalyses = Object.keys(node.attributes)
      .filter((name) => name.startsWith('mrp') && !name.startsWith('mrp0'))
      .length > 0;

    const hasEditingQuestion = !!node.attributes.editingQuestion;

    const classes = classNames(node.attributes.lg || '',
      isOnlySpaces(node)
        ? [isSelected ? selectedNodeClass : 'bg-gray-200']
        : {
          // FIXME: convert classes to tailwind!
          'bg-yellow-500': !notMarked && !isForeignLanguage && needsMorphology && !hasMorphAnalyses,
          [foreignLanguageColors[node.attributes.mrp0sel || '']]: isForeignLanguage,
          'font-bold': isForeignLanguage,
          'text-red-600': node.children.length === 0,
          'bg-yellow-300': !isSelected && !notMarked && hasNoMorphologySelected,
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