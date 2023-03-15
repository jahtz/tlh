import {
  MorphologicalAnalysis,
  MultiMorphologicalAnalysisWithMultiEnclitics,
  MultiMorphologicalAnalysisWithoutEnclitics,
  MultiMorphologicalAnalysisWithSingleEnclitics,
  readMorphologiesFromNode,
  SingleMorphologicalAnalysisWithMultiEnclitics,
  SingleMorphologicalAnalysisWithoutEnclitics,
  SingleMorphologicalAnalysisWithSingleEnclitics,
  writeMorphAnalysisValue
} from '../../model/morphologicalAnalysis';
import {isXmlElementNode, XmlElementNode} from 'simple_xml';
import {displayReplace, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {readSelectedMorphology} from '../../model/selectedMorphologicalAnalysis';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

/**
 * TODO: deprecate?
 */
export interface WordNodeData {
  node: XmlElementNode<'w'>;
  morphologies: MorphologicalAnalysis[];
}

export function readWordNodeData(node: XmlElementNode): WordNodeData {
  const selectedMorphologies = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  return {node: node as XmlElementNode<'w'>, morphologies: readMorphologiesFromNode(node, selectedMorphologies)};
}

export function extractSelMorphAnalysesFromSingleMorphWithoutEnc({selected, number}: SingleMorphologicalAnalysisWithoutEnclitics): string[] {
  return selected ? [number.toString()] : [];
}

export function extractSelMorphAnalysesFromSingleMorphWithSingleEnc({selected, number}: SingleMorphologicalAnalysisWithSingleEnclitics): string[] {
  return selected ? [number.toString()] : [];
}

export function extractSelMorphAnalysesFromSingleMorphWithMultiEnc({number, encliticsAnalysis}: SingleMorphologicalAnalysisWithMultiEnclitics): string[] {
  return encliticsAnalysis.analysisOptions.filter(({selected}) => selected).map(({letter}) => `${number}${letter}`);
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
  switch (ma._type) {
    case 'MultiMorphAnalysisWithoutEnclitics':
      return extractSelMorphAnalysesFromMultiMorphWithoutEnc(ma);
    case 'MultiMorphAnalysisWithSingleEnclitics':
      return extractSelMorphAnalysesFromMultiMorphWithSingleEnc(ma);
    case 'MultiMorphAnalysisWithMultiEnclitics':
      return extractSelMorphAnalysesFromMultiMorphWithMultiEnc(ma);
    case 'SingleMorphAnalysisWithoutEnclitics':
      return extractSelMorphAnalysesFromSingleMorphWithoutEnc(ma);
    case 'SingleMorphAnalysisWithSingleEnclitics':
      return extractSelMorphAnalysesFromSingleMorphWithSingleEnc(ma);
    case 'SingleMorphAnalysisWithMultiEnclitics':
      return extractSelMorphAnalysesFromSingleMorphWithMultiEnc(ma);
  }
}

export function writeWordNodeData({node: originalNode, morphologies}: WordNodeData): XmlElementNode {
  const {tagName, attributes: originalAttributes, children} = originalNode;

  const selectedAnalysisOptions: string[] = morphologies.flatMap(extractSelectedMorphologicalAnalyses);

  const {trans, mrp0sel, ...rest} = originalAttributes;

  const attributes: Record<string, string | undefined> = {
    // put attributes trans and mrp0sel at start of tag...

    trans,
    // FIXME: can mrp0sel == undefined be overwritten?
    mrp0sel: (mrp0sel === undefined || mrp0sel.trim() === 'DEL')
      ? mrp0sel
      : selectedAnalysisOptions.join(' '),
    ...rest
  };

  for (const ma of morphologies) {
    attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
  }

  return {tagName, attributes, children};
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

export const wordNodeConfig: XmlInsertableSingleEditableNodeConfig<WordNodeData> = {
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
        <span className={classes} title={hasEditingQuestion ? node.attributes.q : undefined}>
          {node.children.length === 0 ? <span>&#x2715;</span> : renderedChildren}
        </span>
        &nbsp;&nbsp;
      </>
    );
  },
  edit: (props) => isOnlySpaces(props.data.node)
    ? <SpacesEditor {...props}/>
    : <WordNodeEditor {...props}/>,
  readNode: readWordNodeData,
  writeNode: writeWordNodeData,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  }
};