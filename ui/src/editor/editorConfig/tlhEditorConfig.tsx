import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './editorConfig';
import {LineBreakEditor} from '../LineBreakEditor';
import classNames from 'classnames';
import {wordNodeConfig} from './wordNodeData';
import {LineBreakData, readLineBreakData, writeLineBreakData} from './lineBreakData';

const lb: XmlSingleEditableNodeConfig<LineBreakData> = {
  // TODO: only render <br/> if not first linebreak!
  replace: (node, _renderedChildren, path, currentSelectedPath) => {

    const isSelected = !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.');

    return (
      <>
        <span className={classNames('lb', {'has-background-primary': isSelected})}><br/>{node.attributes.lnr}:</span>
        &nbsp;&nbsp;&nbsp;
      </>
    );
  },
  edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
  readNode: readLineBreakData,
  writeNode: writeLineBreakData,
  insertablePositions: {
    beforeElement: ['lb'],
    asLastChildOf: ['div1']
  }
};

export const tlhEditorConfig: XmlEditorConfig = {
  docID: {replace: () => <span/>},
  'AO:Manuscripts': {replace: () => <span/>},
  lb,

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
  note: {
    replace: (node) => <sup title={node.attributes.c} className="has-text-weight-bold">x</sup>
  }
};
