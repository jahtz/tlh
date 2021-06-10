import React from 'react';
import {nodeReplacement, nodeStyling, xmlEditableNode, XmlNodeDisplayConfig} from './xmlDisplayConfigs';
import {WordNodeEditor} from './WordNodeEditor';


export const tlhNodeDisplayConfig: XmlNodeDisplayConfig = {
  'docID': nodeReplacement(() => <span/>),
  'AO:Manuscripts': nodeReplacement(() => <span/>),
  'lb': nodeReplacement(() => <br/>),

  // Words
  'w': xmlEditableNode(
    (props) => <WordNodeEditor props={props}/>,
    (node) => {
      const selectedMorph = node.attributes.find(({name}) => name === 'mrp0sel');
      return selectedMorph && selectedMorph.value.trim().length > 0 ? [] : ['is-underlined'];
    }
  ),

  // Word contents
  'aGr': nodeStyling(() => ['akkadogramm']),
  'sGr': nodeStyling(() => ['sumerogramm']),
  'd': nodeStyling(() => ['determinativ']),

  'del_in': nodeReplacement(() => <span>[</span>),
  'del_fin': nodeReplacement(() => <span>]</span>),
  'ras_in': nodeReplacement(() => <span>*</span>),
  'ras_fin': nodeReplacement(() => <span>*</span>),
  'laes_in': nodeReplacement(() => <span>⸢</span>),
  'laes_fin': nodeReplacement(() => <span>⸣</span>)
};