import {displayReplace, XmlEditorConfig} from './editorConfig';
import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from '../xmlModel/xmlModel';
import {noteNodeConfig} from './elementEditors/NoteNodeEditor';
import {aoManuscriptsConfig} from './elementEditors/aoManuscriptsConfigData';
import {lineBreakNodeConfig} from './elementEditors/LineBreakEditor';
import {clbNodeConfig} from './elementEditors/ClbEditor';
import {wordNodeConfig} from './elementEditors/wordNodeData';
import {gapConfig} from './elementEditors/gapConfigData';
import {paragraphSeparatorConfig} from './elementEditors/paragraphSeparatorConfig';
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


export const tlhXmlEditorConfig: XmlEditorConfig = {
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
    // FIXME: collides with fragments! {€1}
    .replace(/{/g, '\n\t\t{')
    .replace(/\+=/g, '\n\t\t   += ')
    .replace(/<w/g, '\n <w')
    .replace(/<lb/g, '\n\n<lb')
    .replace(/ mrp/g, '\n\tmrp')
    .replace(/@/g, ' @ ')
};