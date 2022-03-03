import {MorphologicalAnalysis, readMorphologiesFromNode, writeMorphAnalysisValue} from '../../model/morphologicalAnalysis';
import {isXmlElementNode, XmlElementNode} from '../xmlModel/xmlModel';
import {readSelectedMorphology, SelectedAnalysisOption, writeSelectedMorphologies} from '../selectedAnalysisOption';
import {getSelectedLetters} from '../../model/analysisOptions';
import {XmlSingleEditableNodeConfig} from '../editorConfig/editorConfig';
import classNames from 'classnames';
import {IoCloseSharp} from 'react-icons/io5';
import {WordNodeEditor} from './WordNodeEditor';
import {SpacesEditor} from './SpacesEditor';
import {selectedNodeClass} from '../editorConfig/tlhXmlEditorConfig';

export interface WordNodeData {
  node: XmlElementNode;
  lg: string;
  morphologies: MorphologicalAnalysis[];
}

export function readWordNodeData(node: XmlElementNode): WordNodeData {
  return {
    node: node,
    lg: node.attributes.lg || '',
    morphologies: readMorphologiesFromNode(node, readSelectedMorphology(node.attributes.mrp0sel?.trim() || '')),
  };
}

export function writeWordNodeData({node: originalNode, lg, morphologies}: WordNodeData): XmlElementNode {
  const {tagName, attributes, children} = originalNode;

  // FIXME: selected morphologies!

  const node: XmlElementNode = {
    tagName,
    attributes: {...attributes, lg},
    children
  };

  for (const ma of morphologies) {
    node.attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
  }

  const selectedAnalysisOptions: SelectedAnalysisOption[] = morphologies.flatMap((ma) => {

    const enclitics = ma.encliticsAnalysis
      ? 'analysis' in ma.encliticsAnalysis ? undefined : getSelectedLetters(ma.encliticsAnalysis.analysisOptions)
      : undefined;

    if ('analysisOptions' in ma) {
      return getSelectedLetters(ma.analysisOptions).map((letter) => ({number: ma.number, letter, enclitics}));
    } else if (ma.selected) {
      return [{number: ma.number, enclitics}];
    } else {
      return [];
    }
  });

  if (selectedAnalysisOptions.length > 0) {
    node.attributes.mrp0sel = selectedAnalysisOptions.length > 0
      ? writeSelectedMorphologies(selectedAnalysisOptions)
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

export const wordNodeConfig: XmlSingleEditableNodeConfig<WordNodeData> = {
  replace: (node, renderedChildren, isSelected) => {

    const notMarked = node.attributes.mrp0sel === 'DEL';

    const isForeignLanguage = Object.keys(foreignLanguageColors).includes(node.attributes.mrp0sel);

    const needsMorphology = !!node.attributes.mrp0sel;
    const hasNoMorphologySelected = needsMorphology && node.attributes.mrp0sel.trim().length === 0 || node.attributes.mrp0sel === '???';

    const hasMorphAnalyses = Object.keys(node.attributes)
      .filter((name) => name.startsWith('mrp') && !name.startsWith('mrp0'))
      .length > 0;

    const hasQuestion = !!node.attributes.editingQuestion;

    // FIXME: colors / classes!

    const classes = classNames(node.attributes.lg || '',
      isOnlySpaces(node)
        ? [isSelected ? selectedNodeClass : 'bg-gray-200']
        : {
          'underline': !notMarked && hasNoMorphologySelected,
          'bg-teal-400': !notMarked && isSelected,
          'has-background-warning': !notMarked && !isForeignLanguage && needsMorphology && !hasMorphAnalyses,
          'bg-blue-700': hasQuestion,
          [foreignLanguageColors[node.attributes.mrp0sel]]: isForeignLanguage,
          'has-text-weight-bold': isForeignLanguage,
          'has-text-danger': node.children.length === 0
        });

    return <>
        <span className={classes} title={hasQuestion ? node.attributes.q : undefined}>
          {node.children.length === 0 ? <IoCloseSharp/> : renderedChildren}
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