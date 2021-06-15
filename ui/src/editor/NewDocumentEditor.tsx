import React, {useState} from 'react';
import {XmlElementNode, XmlNode} from './xmlModel';
import {EditTriggerFunc, UpdateNode, XmlEditableNode, XmlNodeDisplayConfig} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import {DisplayNode} from './NodeDisplay';
import {useTranslation} from 'react-i18next';

export interface NodeEditorIProps {
  node: XmlNode;
  displayConfig?: XmlNodeDisplayConfig;
}

interface IState {
  editConfig: XmlEditableNode;
  editedNode: XmlElementNode;
  renderedChildren: JSX.Element;
  path: number[];
}

export function NewDocumentEditor({node, displayConfig = tlhNodeDisplayConfig}: NodeEditorIProps): JSX.Element {

  const {t} = useTranslation('common');
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
    // setState(undefined);
  };

  function exportXml(): void {
    console.info('TODO: export xml...');
  }

  return (
    <div className="columns">
      <div className="column">
        <div className="box hittite">
          <DisplayNode node={rootNode} currentNode={state?.editedNode} displayConfig={displayConfig} onEdit={onEdit} path={[]}/>
        </div>

        <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
      </div>
      <div className="column">
        {state && state.editConfig.edit({node: state.editedNode, renderedChildren: state.renderedChildren, updateNode, path: state.path})}
      </div>
    </div>
  );
}