import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from 'simple_xml';
import {isValidElement, ReactElement} from 'react';
import {isXmlEditableNodeConfig, XmlEditorSingleNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {NodePath} from './insertablePositions';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';

export interface InsertStuff {
  insertablePaths: string[];
  insertAsLastChildOf: string[];
  initiateInsert: (path: NodePath) => void;
}

export interface NodeDisplayIProps {
  node: XmlNode;
  currentSelectedPath?: NodePath;
  onSelect?: (node: XmlElementNode, path: NodePath) => void;
  path?: NodePath;
  insertStuff?: InsertStuff;
  isLeftSide: boolean;
}

function InsertButton({initiate}: { initiate: () => void }): ReactElement {
  return (
    <button type="button" onClick={initiate} className="mx-2 px-2 rounded bg-teal-100">+</button>
  );
}

export function NodeDisplay({node, path = [], ...inheritedProps}: NodeDisplayIProps): ReactElement {
  if (isXmlCommentNode(node)) {
    return <></>;
  } else if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const {currentSelectedPath, onSelect, insertStuff, isLeftSide} = inheritedProps;

  const currentConfig: XmlEditorSingleNodeConfig | undefined = tlhXmlEditorConfig.nodeConfigs[node.tagName];

  const renderChildren = () => <>{node.children.map((c, i) => <NodeDisplay key={i} node={c} path={[...path, i]} {...inheritedProps}/>)}</>;

  const isSelected = !!currentSelectedPath && path.join('.') === currentSelectedPath.join('.');

  const replacement = currentConfig?.replace
    ? currentConfig.replace(node, renderChildren, isSelected, isLeftSide)
    : {clickablePrior: renderChildren(), notClickable: undefined, posterior: undefined};

  const {clickablePrior, notClickable, posterior} = isValidElement(replacement)
    ? {clickablePrior: replacement, notClickable: undefined, posterior: undefined}
    : replacement;

  const classes = currentConfig?.styling
    ? currentConfig.styling(node, isSelected, isLeftSide)
    : [];

  const onClick = currentConfig && isXmlEditableNodeConfig(currentConfig) && onSelect
    ? () => onSelect(node, path)
    : undefined;

  return (
    <>
      {insertStuff && insertStuff.insertablePaths.includes(path.join('.')) && <InsertButton initiate={() => insertStuff.initiateInsert(path)}/>}
      <span className={classNames(classes)} onClick={onClick}>{clickablePrior}</span>
      {isLeftSide && notClickable && <span className={classNames(classes)}>{notClickable}</span>}
      {insertStuff && insertStuff.insertAsLastChildOf.includes(node.tagName) &&
        <InsertButton initiate={() => insertStuff.initiateInsert([...path, node.children.length])}/>}
      {posterior}
    </>
  );
}
