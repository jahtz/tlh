import {XmlEditorConfig} from './editorConfig';
import {wordNodeConfig} from './wordNodeData';
import {lineBreakNodeConfig} from './lineBreakData';
import {noteNodeConfig} from './noteData';
import {aoManuscriptsConfig} from './aoManuscriptsConfigData';

export const tlhXmlEditorConfig: XmlEditorConfig = {
  docID: {replace: () => <span/>},
  'AO:Manuscripts': aoManuscriptsConfig,
  lb: lineBreakNodeConfig,

  // Words
  w: wordNodeConfig,

  // Word contents
  aGr: {styling: () => ['akkadogramm']},
  sGr: {styling: () => ['sumerogramm']},
  d: {styling: () => ['determinativ']},

  del_in: {replace: () => <span>[</span>},
  del_fin: {replace: () => <span>]</span>},
  ras_in: {replace: () => <span>*</span>},
  ras_fin: {replace: () => <span>*</span>},
  laes_in: {replace: () => <span>⸢</span>},
  laes_fin: {replace: () => <span>⸣</span>},

  gap: {
    styling: () => ['gap'],
    replace: (node) => <>
      {'t' in node.attributes && node.attributes.t === 'line' && <br/>}
      <span>{node.attributes.c}</span>
    </>
  },

  space: {
    replace: (node) => <>{Array.from({length: parseInt(node.attributes.c) || 0}).map((_, i) => <span key={i}>&nbsp;</span>)}</>,
    styling: () => ['has-background-light']
  },

  parsep: {replace: () => <span>¬¬¬</span>},
  parsep_dbl: {replace: () => <span>===</span>},

  corr: {
    styling: () => ['corr'],
    replace: (node) => <span>{node.attributes.c}</span>
  },
  note: noteNodeConfig
};