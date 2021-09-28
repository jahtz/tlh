import React from 'react';
import {XmlEditableNodeIProps, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {WordNodeEditor} from './WordNodeEditor';
import {GenericAttributes} from './xmlModel/xmlModel';
import classNames from 'classnames';

export interface WordNodeAttributes {
  lg?: 'Sum' | 'Akk' | 'Hit' | 'Hur' | 'Luw' | 'Hat';
  mrp0sel?: string;
}

export const tlhNodeDisplayConfig: XmlNodeDisplayConfigObject = {
  docID: {replace: () => <span/>},
  'AO:Manuscripts': {replace: () => <span/>},
  lb: {
    // TODO: only render <br/> if not first linebreak!
    replace: (node) => <><br style={{marginTop: '10px'}}/>{node.attributes.lnr}:&nbsp;&nbsp;&nbsp;</>,
    styling: () => ['lb']
  },

  // Words
  w: {
    replace: (node, renderedChildren, path, currentSelectedPath) => {

      const needsMorphology = !!node.attributes.mrp0sel;
      const hasNoMorphologySelected = needsMorphology && node.attributes.mrp0sel.trim().length === 0;
      const hasMorphAnalyses = Object.keys(node.attributes)
        .filter((name) => name.startsWith('mrp') && !name.startsWith('mrp0'))
        .length > 0;

      const classes = classNames(node.attributes.lg || '', {
        'is-underlined': hasNoMorphologySelected,
        'has-background-primary': !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.'),
        'has-background-warning': needsMorphology && !hasMorphAnalyses
      });

      return node.children.length === 0
        ? <span className="has-text-danger">&#10008;</span>
        : <>
          <span className={classes}>{renderedChildren}</span>
          &nbsp;&nbsp;
        </>;
    },
    edit: (props: XmlEditableNodeIProps<WordNodeAttributes & GenericAttributes>) => <WordNodeEditor props={props} key={props.path.join('.')}/>
  },

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
    replace: (/*node*/) => <span>!</span>
  }
};
