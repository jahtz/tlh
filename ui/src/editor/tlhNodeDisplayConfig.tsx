import React from 'react';
import {XmlEditableNodeIProps, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {WordNodeEditor} from './WordNodeEditor';
import {XmlWriteConfig} from './xmlModel';
import classNames from 'classnames';


export interface WordNodeAttributes {
  lg?: 'Sum' | 'Akk' | 'Hit' | 'Hur' | 'Luw' | 'Hat';
  mrp0sel?: string;
}

export const tlhNodeDisplayConfig: XmlNodeDisplayConfigObject = {
  docID: {replace: () => <span/>},
  'AO:Manuscripts': {replace: () => <span/>},
  lb: {
    replace: (node) => <><br style={{marginTop: '10px'}}/>{node.attributes.lnr}:&nbsp;&nbsp;&nbsp;</>,
    styling: () => ['lb']
  },

  // Words
  w: {
    replace: (node, renderedChildren, path, currentSelectedPath) => {
      const classes = classNames(node.attributes.lg || '', {
        'is-underlined': !!node.attributes.mrp0sel && node.attributes.mrp0sel.trim().length === 0,
        'has-background-primary': !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.')
      });
      return <><span className={classes}>{renderedChildren}</span>&nbsp;&nbsp;</>;
    },
    edit: (props: XmlEditableNodeIProps<WordNodeAttributes>) => <WordNodeEditor props={props} key={props.path.join('.')}/>
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
    replace: (node) => <span>{node.attributes.c}</span>
  },

  corr: {
    styling: () => ['corr'],
    replace: (/*node*/) => <span>!</span>
  }
};

export const tlhXmlWriteConfig: XmlWriteConfig = {
  docID: {inlineChildren: true},

  'creation-date': {contractEmpty: true},
  kor2: {contractEmpty: true},
  annot: {contractEmpty: true},

  'AO:TxtPubl': {inlineChildren: true},

  parsep: {contractEmpty: true},
  parsep_dbl: {contractEmpty: true},

  lb: {contractEmpty: true},

  w: {contractEmpty: false, inlineChildren: true},

  aGr: {inlineChildren: true},
  sGr: {inlineChildren: true},
  d: {inlineChildren: true},

  del_in: {contractEmpty: true},
  del_fin: {contractEmpty: true},
  ras_in: {contractEmpty: true},
  ras_fin: {contractEmpty: true},
  laes_in: {contractEmpty: true},
  laes_fin: {contractEmpty: true}
};