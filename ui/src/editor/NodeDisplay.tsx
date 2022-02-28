import {isXmlTextNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {tlhXmlEditorConfig} from './editorConfig/tlhXmlEditorConfig';
import classNames from 'classnames';
import {NodePath} from './insertablePositions';
import {IoAddOutline} from 'react-icons/io5';
import {Fragment} from 'react';

export interface InsertStuff {
  insertablePaths: string[];
  insertAsLastChildOf: string[];
  initiateInsert: (path: NodePath) => void;
}

export interface NodeDisplayIProps {
  node: XmlNode;
  currentSelectedPath?: NodePath;
  onSelect?: EditTriggerFunc;
  path?: NodePath;
  insertStuff?: InsertStuff;
}

export function NodeDisplay({node, currentSelectedPath, onSelect, path = [], insertStuff}: NodeDisplayIProps): JSX.Element {
  if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const currentConfig = tlhXmlEditorConfig.nodeConfigs[node.tagName];

  const renderedChildren = <>
    {node.children.map((c, i) => <Fragment key={i}>
        <NodeDisplay node={c} currentSelectedPath={currentSelectedPath} onSelect={onSelect} path={[...path, i]} insertStuff={insertStuff}/>
      </Fragment>
    )}
  </>;

  const isSelected = !!currentSelectedPath && path.join('.') === currentSelectedPath.join('.');

  const display = currentConfig && currentConfig.replace
    ? currentConfig.replace(node, renderedChildren, isSelected)
    : renderedChildren;

  const classes = currentConfig && currentConfig.styling
    ? currentConfig.styling(node, isSelected)
    : [];

  const onClick = currentConfig && 'edit' in currentConfig && onSelect
    ? () => onSelect(node, path)
    : undefined;

  return (
    <>
      {insertStuff && insertStuff.insertablePaths.includes(path.join('.')) &&
        <span>&nbsp;
          <button onClick={() => insertStuff.initiateInsert(path)}><IoAddOutline/></button>
          &nbsp;&nbsp;</span>}
      <span className={classNames(classes)} onClick={onClick}>{display}</span>
      {insertStuff && insertStuff.insertAsLastChildOf.includes(node.tagName) &&
        <span><button onClick={() => insertStuff.initiateInsert([...path, node.children.length])}><IoAddOutline/></button>
          &nbsp;</span>}
    </>
  );
}
