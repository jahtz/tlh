import {isXmlTextNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc, XmlEditorConfig} from './editorConfig/editorConfig';
import {tlhXmlEditorConfig} from './editorConfig/tlhXmlEditorConfig';
import classNames from 'classnames';
import {NodePath} from './insertablePositions';
import {IoAddOutline} from 'react-icons/io5';

export interface InsertStuff {
  insertablePaths: string[];
  initiateInsert: (path: NodePath) => void;
}

export interface NodeDisplayIProps {
  node: XmlNode;
  currentSelectedPath?: NodePath;
  editorConfig?: XmlEditorConfig;
  onSelect?: EditTriggerFunc;
  path?: NodePath;
  insertStuff?: InsertStuff;
}

export function NodeDisplay({
  node,
  currentSelectedPath,
  editorConfig = tlhXmlEditorConfig(),
  onSelect,
  path = [],
  insertStuff,
}: NodeDisplayIProps): JSX.Element {
  if (isXmlTextNode(node)) {
    return <span>{node.textContent}</span>;
  }

  const currentConfig = editorConfig[node.tagName];

  const renderedChildren = <>
    {node.children.map((c, i) =>
      <NodeDisplay key={i} node={c} editorConfig={editorConfig} currentSelectedPath={currentSelectedPath} onSelect={onSelect} path={[...path, i]}
                   insertStuff={insertStuff}/>
    )}
  </>;

  const display = currentConfig && currentConfig.replace
    ? currentConfig.replace(node, renderedChildren, path, currentSelectedPath)
    : renderedChildren;

  const classes = currentConfig && currentConfig.styling
    ? currentConfig.styling(node, path, currentSelectedPath)
    : [];

  const onClick = currentConfig && 'edit' in currentConfig && onSelect
    ? () => onSelect(node, path)
    : () => void 0;


  // FIXME: display addon buttons!

  return (
    <>
      {insertStuff && insertStuff.insertablePaths.includes(path.join('.')) && <span>
        &nbsp;
        <button onClick={() => insertStuff.initiateInsert(path)}><IoAddOutline/></button>
        &nbsp;&nbsp;
      </span>}
      <span className={classNames(classes)} onClick={onClick}>{display}</span>
    </>
  );
}
