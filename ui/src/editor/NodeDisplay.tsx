import {isXmlTextNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import classNames from 'classnames';
import React from 'react';

interface NodeDisplayIProps {
  node: XmlNode;
  displayConfig?: XmlNodeDisplayConfigObject;
  currentSelectedPath: number[] | undefined;
  onSelect?: EditTriggerFunc;
  path?: number[];
}

export function NodeDisplay({node, currentSelectedPath, displayConfig = tlhNodeDisplayConfig, onSelect, path = []}: NodeDisplayIProps): JSX.Element {
  if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const currentConfig = displayConfig[node.tagName];

  const renderedChildren = <>
    {node.children.map((c, i) =>
      <NodeDisplay key={i} node={c} displayConfig={displayConfig} currentSelectedPath={currentSelectedPath} onSelect={onSelect} path={[...path, i]}/>
    )}
  </>;

  const display = currentConfig?.replace
    ? currentConfig.replace(node, renderedChildren, path, currentSelectedPath)
    : renderedChildren;

  const classes = currentConfig?.styling ? currentConfig.styling(node, path, currentSelectedPath) : [];

  const onClick = currentConfig?.edit && onSelect
    ? () => onSelect(node, path)
    : () => void 0;

  return <span className={classNames(classes)} onClick={onClick}>{display}</span>;
}
