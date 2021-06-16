import React from 'react';
import {nodeReplacement, nodeStyling, xmlEditableNode, XmlNodeDisplayConfig} from './xmlDisplayConfigs';
import {WordNodeEditor} from './WordNodeEditor';
import {XmlWriteConfig} from './xmlModel';


export const tlhNodeDisplayConfig: XmlNodeDisplayConfig = {
  docID: nodeReplacement(() => <span/>),
  'AO:Manuscripts': nodeReplacement(() => <span/>),
  lb: nodeReplacement((node) => <><br/><span>{node.attributes.lnr}</span>&nbsp;</>),

  // Words
  w: xmlEditableNode(
    (props) => <WordNodeEditor props={props} key={props.path.join('.')}/>,
    (node, path, currentSelectedPath) => {
      return {
        'is-underlined': !!node.attributes.mrp0sel && node.attributes.mrp0sel.trim().length > 0,
        'has-background-primary': !!currentSelectedPath && currentSelectedPath.join('.') === path.join('.')
      };
    }
  ),

  // Word contents
  aGr: nodeStyling(() => ['akkadogramm']),
  sGr: nodeStyling(() => ['sumerogramm']),
  d: nodeStyling(() => ['determinativ']),

  del_in: nodeReplacement(() => <span>[</span>),
  del_fin: nodeReplacement(() => <span>]</span>),
  ras_in: nodeReplacement(() => <span>*</span>),
  ras_fin: nodeReplacement(() => <span>*</span>),
  laes_in: nodeReplacement(() => <span>⸢</span>),
  laes_fin: nodeReplacement(() => <span>⸣</span>)
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