import React from 'react';
import {XmlEditableNodeIProps, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {WordNodeEditor} from './WordNodeEditor';
import {XmlWriteConfig} from './xmlModel';


export const tlhNodeDisplayConfig: XmlNodeDisplayConfigObject = {
  docID: {replace: () => <span/>},
  'AO:Manuscripts': {replace: () => <span/>},
  lb: {replace: (node) => <><br/><span>{node.attributes.lnr}</span>&nbsp;</>},

  // Words
  w: {
    replace: (node, renderedChildren) => <>{renderedChildren}&nbsp;&nbsp;</>,
    edit: (props:XmlEditableNodeIProps) => <WordNodeEditor props={props} key={props.path.join('.')}/>,
    styling: (node, path, currentSelectedPath) => {
      return {
        'is-underlined': !!node.attributes.mrp0sel && node.attributes.mrp0sel.trim().length === 0,
        'has-background-primary': !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.')
      };
    }
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
  laes_fin: {replace: () => <span>⸣</span>}
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