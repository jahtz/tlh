import {isXmlTextNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {tlhXmlEditorConfig} from './editorConfig/tlhXmlEditorConfig';
import classNames from 'classnames';
import {NodePath} from './insertablePositions';
import {IoAddOutline} from 'react-icons/io5';

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
  isLeftSide: boolean;
}

export function NodeDisplay({node, path = [], ...inheritedProps}: NodeDisplayIProps): JSX.Element {

  if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const {currentSelectedPath, onSelect, insertStuff, isLeftSide} = inheritedProps;

  const currentConfig = tlhXmlEditorConfig.nodeConfigs[node.tagName];

  const renderedChildren = <>
    {node.children.map((c, i) => <NodeDisplay key={i} node={c} path={[...path, i]} {...inheritedProps}/>)}
  </>;

  const isSelected = !!currentSelectedPath && path.join('.') === currentSelectedPath.join('.');

  const display = currentConfig && currentConfig.replace
    ? currentConfig.replace(node, renderedChildren, isSelected, isLeftSide)
    : renderedChildren;

  const classes = currentConfig && currentConfig.styling
    ? currentConfig.styling(node, isSelected, isLeftSide)
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
