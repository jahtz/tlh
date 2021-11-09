import {MorphologicalAnalysis, readMorphologiesFromNode, writeMorphAnalysisValue} from '../../model/morphologicalAnalysis';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {readSelectedMorphology, SelectedAnalysisOption, writeSelectedMorphologies} from '../selectedAnalysisOption';
import {getSelectedLetters} from '../../model/analysisOptions';

export interface WordNodeData {
  lg: string;
  morphologies: MorphologicalAnalysis[];
  originalNode: XmlElementNode;
}

export function readWordNodeData(originalNode: XmlElementNode): WordNodeData {
  return {
    lg: originalNode.attributes.lg || '',
    morphologies: readMorphologiesFromNode(originalNode, readSelectedMorphology(originalNode.attributes.mrp0sel?.trim() || '')),
    originalNode: originalNode
  };
}

export function writeWordNodeData({lg, morphologies, originalNode}: WordNodeData): XmlElementNode {
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

  node.attributes.mrp0sel = selectedAnalysisOptions.length > 0
    ? writeSelectedMorphologies(selectedAnalysisOptions)
    : ' ';


  return node;
}