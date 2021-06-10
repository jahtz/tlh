import React, {useState} from 'react';
import {XmlElementNode, XmlNode} from './xmlModel';
import {EditTriggerFunc, UpdateNode, XmlEditableNode, XmlNodeDisplayConfig} from './xmlDisplayConfigs';
import classNames from 'classnames';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';

interface IProps {
  node: XmlNode;
  displayConfig?: XmlNodeDisplayConfig;
}

interface NodeDisplayIProps extends IProps {
  currentNode?: XmlElementNode;
  onEdit: (node: XmlElementNode, renderedChildren: JSX.Element, e: XmlEditableNode, path: number[]) => void;
  path: number[];
}

function DisplayNode({node, currentNode, displayConfig = tlhNodeDisplayConfig, onEdit, path}: NodeDisplayIProps): JSX.Element {
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

interface IState {
  editedNode: XmlElementNode;
  renderedChildren: JSX.Element;
  editConfig: XmlEditableNode;
  path: number[];
}

export function NewDocumentEditor({node, displayConfig = tlhNodeDisplayConfig}: IProps): JSX.Element {

  const [rootNode, setRootNode] = useState(node);
  const [state, setState] = useState<IState | undefined>();

  const onEdit: EditTriggerFunc = (editedNode, renderedChildren, editConfig, path) => {
    setState({editedNode, renderedChildren, editConfig, path});
  };

  const updateNode: UpdateNode = (node, path) => {
    setRootNode((currentRootNode) => {
      let nodeToUpdate: XmlElementNode = currentRootNode as XmlElementNode;
      path.slice(0, -1).forEach((pathContent) => {
        nodeToUpdate = nodeToUpdate.children[pathContent] as XmlElementNode;
      });

      nodeToUpdate.children[path[path.length]] = node;

      return currentRootNode;
    });
    setState(undefined);
  };

  function cancelEdit(): void {
    setState(undefined);
  }

  return (
    <div className="columns">
      <div className="column">
        <div className="box hittite">
          <DisplayNode node={rootNode} currentNode={state?.editedNode} displayConfig={displayConfig} onEdit={onEdit} path={[]}/>
        </div>
      </div>
      <div className="column">
        {state && state.editConfig.edit({node: state.editedNode, renderedChildren: state.renderedChildren, updateNode, cancelEdit, path: state.path})}
      </div>
    </div>
  );
}