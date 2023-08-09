import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from 'simple_xml';
import {isValidElement, ReactElement} from 'react';
import {isXmlEditableNodeConfig, XmlEditorSingleNodeConfig} from './editorConfig';
import {NodePath} from './insertablePositions';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';

export interface InsertionData {
  insertablePaths: string[];
  insertAsLastChildOf: string[];
  initiateInsert: (path: NodePath) => void;
}

export interface NodeDisplayIProps {
  rootNode?: XmlElementNode;
  node: XmlNode;
  currentSelectedPath?: NodePath;
  onSelect?: (node: XmlElementNode, path: NodePath) => void;
  path?: NodePath;
  insertionData?: InsertionData;
  isLeftSide: boolean;
}

const InsertButton = ({initiate}: { initiate: () => void }): ReactElement => (
  <button type="button" onClick={initiate} className="mx-2 px-2 rounded bg-teal-100">+</button>
);

export function NodeDisplay({node, path = [], ...inheritedProps}: NodeDisplayIProps): ReactElement {
  if (isXmlCommentNode(node)) {
    return <></>;
  }

  if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const {rootNode, currentSelectedPath, onSelect, insertionData, isLeftSide} = inheritedProps;

  const currentConfig: XmlEditorSingleNodeConfig | undefined = tlhXmlEditorConfig.nodeConfigs[node.tagName];

  const renderChildren = () => <>{node.children.map((c, i) => <NodeDisplay key={i} node={c} path={[...path, i]} {...inheritedProps}/>)}</>;

  const isSelected = !!currentSelectedPath && path.join('.') === currentSelectedPath.join('.');

  const replacement = currentConfig?.replace
    ? currentConfig.replace({rootNode, node, path, renderChildren, isSelected, isLeftSide})
    : {clickablePrior: renderChildren(), notClickable: undefined, posterior: undefined};

  const {clickablePrior, notClickable, posterior} = isValidElement(replacement)
    ? {clickablePrior: replacement, notClickable: undefined, posterior: undefined}
    : replacement;

  const onClick = currentConfig && isXmlEditableNodeConfig(currentConfig) && onSelect
    ? () => onSelect(node, path)
    : undefined;

  return (
    <>
      {insertionData && insertionData.insertablePaths.includes(path.join('.')) && <InsertButton initiate={() => insertionData.initiateInsert(path)}/>}
      <span onClick={onClick}>{clickablePrior}</span>
      {isLeftSide && notClickable}
      {insertionData && insertionData.insertAsLastChildOf.includes(node.tagName) &&
        <InsertButton initiate={() => insertionData.initiateInsert([...path, node.children.length])}/>}
      {posterior}
    </>
  );
}
