import {XmlElementNode} from './xmlModel';
import {XmlEditableNode} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import classNames from 'classnames';
import React from 'react';
import {NodeEditorIProps} from './NewDocumentEditor';

interface NodeDisplayIProps extends NodeEditorIProps {
  currentNode?: XmlElementNode;
  onEdit: (node: XmlElementNode, renderedChildren: JSX.Element, e: XmlEditableNode, path: number[]) => void;
  path: number[];
}

export function DisplayNode({node, currentNode, displayConfig = tlhNodeDisplayConfig, onEdit, path}: NodeDisplayIProps): JSX.Element {
  if (node.__type === 'XmlTextNode') {
    return <span>{node.textContent}</span>;
  }

  const currentConfig = displayConfig[node.tagName];

  const renderedChildren = <>{node.children.map((c, i) =>
    <DisplayNode key={i} node={c} currentNode={currentNode} displayConfig={displayConfig} onEdit={onEdit} path={[...path, i]}/>
  )}</>;

  if (!currentConfig) {
    return renderedChildren;
  } else if (currentConfig.__type === 'XmlNodeReplacement') {
    return currentConfig.f(node);
  } else if (currentConfig.__type === 'XmlNodeStyling') {
    return <span className={classNames(currentConfig.f(node))}>{renderedChildren}</span>;
  } else {
    // Editable node!
    const classes = currentConfig.styling ? currentConfig.styling(node) : [];

    return <span className={classNames(classes)} onClick={() => onEdit(node, renderedChildren, currentConfig, path)}>{renderedChildren}</span>;
  }
}
