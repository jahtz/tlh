import {XmlNode} from './xmlModel';
import {EditTriggerFunc, XmlNodeDisplayConfig} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import classNames from 'classnames';
import React from 'react';

interface NodeDisplayIProps {
  node: XmlNode;
  displayConfig?: XmlNodeDisplayConfig;
  currentSelectedPath: number[] | undefined;
  onEdit: EditTriggerFunc;
  path: number[];
}

export function DisplayNode({node, currentSelectedPath, displayConfig = tlhNodeDisplayConfig, onEdit, path}: NodeDisplayIProps): JSX.Element {
  if (node.__type === 'XmlTextNode') {
    return <span>{node.textContent}</span>;
  }

  const currentConfig = displayConfig[node.tagName];

  const renderedChildren = <>
    {node.children.map((c, i) =>
      <DisplayNode key={i} node={c} displayConfig={displayConfig} currentSelectedPath={currentSelectedPath} onEdit={onEdit} path={[...path, i]}/>
    )}
  </>;

  if (!currentConfig) {
    return renderedChildren;
  } else if (currentConfig.__type === 'XmlNodeReplacement') {
    return currentConfig.f(node);
  } else if (currentConfig.__type === 'XmlNodeStyling') {
    return <span className={classNames(currentConfig.f(node, path, currentSelectedPath))}>{renderedChildren}</span>;
  } else {
    // Editable node!
    const classes = currentConfig.styling ? currentConfig.styling(node, path, currentSelectedPath) : [];

    return <span className={classNames(classes)} onClick={() => onEdit(node, path)}>{renderedChildren}</span>;
  }
}
