import {displayReplace, XmlEditorConfig} from './editorConfig';
import {isXmlCommentNode, isXmlTextNode, LetterCorrection, XmlElementNode, XmlNode} from 'simple_xml';
import {noteNodeConfig} from './elementEditors/NoteNodeEditor';
import {aoManuscriptsConfig} from './elementEditors/AoManuscriptsEditor';
import {lineBreakNodeConfig} from './elementEditors/LineBreakEditor';
import {clbNodeConfig} from './elementEditors/ClbEditor';
import {wordNodeConfig} from './elementEditors/wordNodeData';
import {gapConfig} from './elementEditors/GapEditor';
import {paragraphSeparatorConfig} from './elementEditors/ParagraphSeparatorEditor';
import {clEditorConfig} from './elementEditors/ClEditor';

export const selectedNodeClass = 'bg-teal-400';

export function reCountNodeNumbers(rootNode: XmlElementNode, tagName: string, attrName: string): void {

  function go(node: XmlNode, currentCount: number): number {
    if (isXmlTextNode(node) || isXmlCommentNode(node)) {
      return currentCount;
    } else {
      if (node.tagName === tagName) {
        node.attributes[attrName] = currentCount.toString();
        currentCount++;
      }

      for (const child of node.children) {
        currentCount = go(child, currentCount);
      }

      return currentCount;
    }
  }

  go(rootNode, 1);
}

const letterCorrections: LetterCorrection = [
  // Corrections
  ['š', 'š' /* kombi zu 161 */], ['Š', 'Š' /* kombi zu 160 */],
  ['ḫ̮', 'ḫ'], ['Ḫ̮', 'Ḫ'], ['ḫ', 'ḫ'], ['Ḫ', 'Ḫ'], ['h', 'ḫ'], ['H', 'Ḫ'],
  ['̮', '' /* Achtung, überzähliger Bogen unter Het! schlecht sichtbar */],
  ['〈', '〈' /* U+3008 aus CJK zu  U+2329 */], ['〉', '〉'],
  // Harmonizations
  ['á', 'á'], ['à', 'à'], ['â', 'â'], ['ā', 'ā'],
  ['é', 'é'], ['è', 'è'], ['ê', 'ê'], ['ē', 'ē'],
  ['í', 'í'], ['ì', 'ì'], ['î', 'î'], ['ī', 'ī'],
  ['ú', 'ú'], ['ù', 'ù'], ['û', 'û'], ['ū', 'ū'],
];

export const tlhXmlEditorConfig: XmlEditorConfig = {
  readConfig: {
    w: {
      letterCorrections,
      keepSpaces: true
    }
  },
  writeConfig: {
    inlineChildrenOf: ['w']
  },
  nodeConfigs: {
    docID: {
      replace: () => displayReplace(<span/>)
    },
    'AO:Manuscripts': aoManuscriptsConfig,
    'AO:ParagrNr': {
      replace: (node) => displayReplace(<div className="mt-4 font-bold italic">{node.attributes.c}</div>)
    },
    lb: lineBreakNodeConfig,

    clb: clbNodeConfig,
    cl: clEditorConfig,

    // Words
    w: wordNodeConfig,

    // Word contents
    aGr: {styling: () => ['akkadogramm']},
    sGr: {styling: () => ['sumerogramm']},
    d: {styling: () => ['determinativ']},

    del_in: {replace: () => displayReplace(<span>[</span>)},
    del_fin: {replace: () => displayReplace(<span>]</span>)},
    ras_in: {replace: () => displayReplace(<span>*</span>)},
    ras_fin: {replace: () => displayReplace(<span>*</span>)},
    laes_in: {replace: () => displayReplace(<span>⸢</span>)},
    laes_fin: {replace: () => displayReplace(<span>⸣</span>)},

    materlect: {
      replace: (node) => displayReplace(<span className="materLectionis">{node.attributes.c}</span>)
    },

    gap: gapConfig,
    subscr: {replace: (node) => displayReplace(<sub>{node.attributes.c}</sub>)},

    space: {
      replace: (node) => displayReplace(
        <>{Array.from({length: parseInt(node.attributes.c || '0') || 0}).map((_, i) => <span key={i}>&nbsp;</span>)}</>
      )
    },

    parsep: paragraphSeparatorConfig,
    parsep_dbl: paragraphSeparatorConfig,

    corr: {
      styling: () => ['corr'],
      replace: (node) => displayReplace(<span>{node.attributes.c}</span>)
    },
    note: noteNodeConfig
  },
  beforeExport: (rootNode: XmlElementNode) => {
    reCountNodeNumbers(rootNode, 'node', 'n');
    reCountNodeNumbers(rootNode, 'clb', 'nr');
    return rootNode;
  },
  afterExport: (exported: string) => exported
    .replace(/®/g, '\n\t')
    .replace(/{/g, '\n\t\t{')
    .replace(/\+=/g, '\n\t\t   += ')
    .replace(/<w/g, '\n <w')
    .replace(/<lb/g, '\n\n<lb')
    .replace(/ mrp/g, '\n\tmrp')
    .replace(/@/g, ' @ ')
};