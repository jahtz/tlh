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

interface IEditState {
  editConfig: XmlEditableNode;
  editProps: {
    node: XmlElementNode;
    renderedChildren: JSX.Element;
    path: number[]
  };
}

interface IState {
  rootNode: XmlNode;
  editState?: IEditState;
}

export function NewDocumentEditor({node: initialNode, displayConfig = tlhNodeDisplayConfig}: NodeEditorIProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({rootNode: initialNode});

  const onEdit: EditTriggerFunc = (node, renderedChildren, editConfig, path) =>
    setState(({rootNode}) => {
      return {rootNode, editState: {editConfig, editProps: {node, renderedChildren, path}}};
    });

  const updateNode: UpdateNode = (node, path) => {
    setState(({rootNode, editState}) => {

      const nodeToUpdate = path.slice(0, -1).reduce<XmlElementNode>(
        (nodeToUpdate, pathContent) => nodeToUpdate.children[pathContent] as XmlElementNode,
        rootNode as XmlElementNode
      );

      nodeToUpdate.children[path[path.length]] = node;

      return {rootNode, editState};
    });
  };

  function exportXml(): void {
    console.error('TODO: export xml...');
  }

  return (
    <div className="columns">
      <div className="column">
        <div className="box hittite">
          <DisplayNode node={state.rootNode} currentNode={state.editState?.editProps.node} displayConfig={displayConfig} onEdit={onEdit} path={[]}/>
        </div>

        <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
      </div>
      <div className="column">
        {state.editState && state.editState.editConfig.edit({...state.editState.editProps, updateNode})}
      </div>
    </div>
  );
}