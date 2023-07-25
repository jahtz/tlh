import {XmlEditorConfig, XmlEditorSingleNodeConfig, XmlSingleEditableNodeConfig} from './editorConfig';
import {isXmlCommentNode, isXmlTextNode, LetterCorrection, xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {noteNodeConfig} from './elementEditors/NoteNodeEditor';
import {aoManuscriptsConfig} from './elementEditors/AoManuscriptsEditor';
import {lineBreakNodeConfig} from './elementEditors/LineBreakEditor';
import {clbNodeConfig} from './elementEditors/ClbEditor';
import {wordNodeConfig} from './elementEditors/wordNodeData';
import {gapConfig} from './elementEditors/GapEditor';
import {paragraphSeparatorConfig} from './elementEditors/ParagraphSeparatorEditor';
import {clEditorConfig} from './elementEditors/ClEditor';
import {textElementConfig} from './textElementConfig';
import {deviConfig} from './deviConfig';
import {wsepConfig} from './elementEditors/wsepEditor';

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
    w: {
      inlineChildren: true,
      orderAttributes: ({mrp0sel, trans, ...rest}) => [['trans', trans], ['mrp0sel', mrp0sel], ...Object.entries(rest)]
    }
  },
  nodeConfigs: {
    docID: {replace: () => <span/>},
    merged: {replace: () => <span/>},

    'AO:Manuscripts': aoManuscriptsConfig,
    'AO:TxtPubl': {
      replace: (node, renderChildren/*, isSelected, isLeftSide*/) =>
        <span>{renderChildren()} {node.attributes.nr && <span>&#123;{node.attributes.nr}&#125;</span>}</span>
    },
    'AO:DirectJoin': {replace: () => <span>&nbsp;+&nbsp;</span>},
    'AO:InDirectJoin': {replace: () => <span>&nbsp;(+)&nbsp;</span>},
    'AO:ParagrNr': {replace: (node) => <div className="mt-4 font-bold italic">{node.attributes.c}</div>},

    lb: lineBreakNodeConfig as XmlEditorSingleNodeConfig,

    clb: clbNodeConfig as XmlEditorSingleNodeConfig,
    cl: clEditorConfig as XmlEditorSingleNodeConfig,

    devi: deviConfig as XmlSingleEditableNodeConfig,

    // Words
    w: wordNodeConfig as XmlSingleEditableNodeConfig,

    // Word contents
    aGr: {styling: () => ['akkadogramm']},
    sGr: {styling: () => ['sumerogramm']},
    d: {styling: () => ['determinativ']},

    add_in: {replace: () => <span>〈</span>},
    add_fin: {replace: () => <span>〉</span>},
    del_in: {replace: () => <span>[</span>},
    del_fin: {replace: () => <span>]</span>},
    ras_in: {replace: () => <span>*</span>},
    ras_fin: {replace: () => <span>*</span>},
    laes_in: {replace: () => <span>⸢</span>},
    laes_fin: {replace: () => <span>⸣</span>},

    materlect: {replace: (node) => <span className="materLectionis">{node.attributes.c}</span>},

    surpl: {replace: (node) => <span>〈〈{node.attributes.c}〉〉</span>},

    gap: gapConfig,
    subscr: {replace: (node) => <sub>{node.attributes.c}</sub>},

    wsep: wsepConfig as XmlEditorSingleNodeConfig,

    space: {
      replace: (node) => <>{Array.from({length: parseInt(node.attributes.c || '0') || 0}).map((_, i) => <span key={i}>&nbsp;</span>)}</>,
      insertablePositions: {
        beforeElement: ['w'],
        afterElement: ['lb', 'w'],
        asLastChildOf: ['div1'],
        newElement: () => xmlElementNode('w', {}, [xmlElementNode('space', {c: '1'})])
      }
    },

    text: textElementConfig as XmlEditorSingleNodeConfig,

    parsep: paragraphSeparatorConfig,
    parsep_dbl: paragraphSeparatorConfig,

    corr: {
      styling: () => ['corr'],
      replace: (node) => <span>{node.attributes.c}</span>
    },
    note: noteNodeConfig as XmlEditorSingleNodeConfig
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