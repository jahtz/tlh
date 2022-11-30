import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from '../xmlModel/xmlModel';
import {isXmlEditableNodeConfig, XmlEditorNodeConfig} from './editorConfig';
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

function InsertButton({initiate}: { initiate: () => void }): JSX.Element {
  return (
    <button type="button" onClick={initiate} className="mx-2 px-2 rounded bg-teal-100">+</button>
  );
}

export function NodeDisplay({node, path = [], ...inheritedProps}: NodeDisplayIProps): JSX.Element {
  if (isXmlCommentNode(node)) {
    return <></>;
  } else if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const {currentSelectedPath, onSelect, insertStuff, isLeftSide} = inheritedProps;

  const currentConfig: XmlEditorNodeConfig | undefined = tlhXmlEditorConfig.nodeConfigs[node.tagName];

  const renderedChildren = (
    <>{node.children.map((c, i) => <NodeDisplay key={i} node={c} path={[...path, i]} {...inheritedProps}/>)}</>
  );

  const isSelected = !!currentSelectedPath && path.join('.') === currentSelectedPath.join('.');

  const {clickable, notClickable} = currentConfig?.replace
    ? currentConfig.replace(node, renderedChildren, isSelected, isLeftSide)
    : {clickable: renderedChildren, notClickable: undefined};

  const classes = currentConfig?.styling
    ? currentConfig.styling(node, isSelected, isLeftSide)
    : [];

  const onClick = currentConfig && isXmlEditableNodeConfig(currentConfig) && onSelect
    ? () => onSelect(node, path)
    : undefined;

  return (
    <>
      {insertStuff && insertStuff.insertablePaths.includes(path.join('.')) && <InsertButton initiate={() => insertStuff.initiateInsert(path)}/>}
      <span className={classNames(classes)} onClick={onClick}>{clickable}</span>
      {notClickable && <span className={classNames(classes)}>{notClickable}</span>}
      {insertStuff && insertStuff.insertAsLastChildOf.includes(node.tagName) &&
        <InsertButton initiate={() => insertStuff.initiateInsert([...path, node.children.length])}/>}
    </>
  );
}
