import React, {useEffect, useState} from 'react';
import {isXmlElementNode, XmlElementNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc, UpdateNodeFunc, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import {DisplayNode} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorConfigSelector} from '../store/store';
import classNames from 'classnames';
import {writeNode} from './xmlModel/xmlWriting';

interface IProps {
  node: XmlNode;
  filename: string;
  displayConfig?: XmlNodeDisplayConfigObject;
  download: (content: string) => void;
}

interface IEditState {
  node: XmlElementNode;
  path: number[];
}

interface IState {
  rootNode: XmlNode;
  editState?: IEditState;
}

function searchEditableNode(tagName: string, rootNode: XmlElementNode, currentPath: number[], forward: boolean): number[] | undefined {
  if (rootNode.tagName === tagName) {
    return [];
  }

  const [pathHead, ...pathTail] = currentPath;

  let firstSearch: number;
  if (currentPath.length > 0) {
    firstSearch = pathTail.length === 0 ? (forward ? pathHead + 1 : pathHead - 1) : pathHead;
  } else {
    firstSearch = forward ? 0 : rootNode.children.length - 1;
  }

  for (let i = firstSearch; i < rootNode.children.length && i >= 0; forward ? i++ : i--) {
    const child = rootNode.children[i];

    const pathRest = i === pathHead ? pathTail : [];

    const foundChild = isXmlElementNode(child)
      ? searchEditableNode(tagName, child, pathRest, forward)
      : undefined;

    if (foundChild) {
      return [i, ...foundChild];
    }
  }
}

function findElement(node: XmlElementNode, path: number[]): XmlElementNode {
  return path.reduce<XmlElementNode>((nodeToUpdate, pathContent) => nodeToUpdate.children[pathContent] as XmlElementNode, node);
}

export function NewDocumentEditor({node: initialNode, displayConfig = tlhNodeDisplayConfig, download, filename}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorConfigSelector);
  const [state, setState] = useState<IState>({rootNode: initialNode});
  const [keyHandlingEnabled, setKeyHandlingEnabled] = useState(true);
  const [useSerifFont, setUseSerifFont] = useState(false);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  const onEdit: EditTriggerFunc = (node, path) => setState(({rootNode}) => ({rootNode, editState: {node, path}}));

  const updateNode: UpdateNodeFunc = (node, path) => setState(({rootNode, editState}) => {
    findElement(rootNode as XmlElementNode, path.slice(0, -1)).children[path[path.length - 1]] = node;

    return {rootNode, editState};
  });

  const exportXml = () => download(writeNode(state.rootNode).join('\n'));

  const editConfig = state.editState
    ? displayConfig[state.editState.node.tagName]
    : undefined;

  function jumpEditableNodes(tagName: string, forward: boolean): void {
    if (state.editState) {
      const currentPath = state.editState.path;

      const path = searchEditableNode(tagName, state.rootNode as XmlElementNode, currentPath, forward);
      if (path) {
        const node = findElement(state.rootNode as XmlElementNode, path);

        setState(({rootNode}) => {
          return {rootNode, editState: {node, path}};
        });
      }
    }
  }

  function handleKey(event: KeyboardEvent): void {
    if (state.editState && keyHandlingEnabled) {
      if (editorConfig.nextEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editState.node.tagName, true);
      } else if (editorConfig.previousEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editState.node.tagName, false);
      }
    }
  }

  return (
    <div className="columns">
      <div className="column">

        <div className="card">
          <header className="card-header">
            <p className="card-header-title">{filename}</p>
          </header>
          <div className="card-content">
            <div className={classNames(/*'box',*/ 'documentText', useSerifFont ? 'font-hpm-serif' : 'font-hpm')}>
              <DisplayNode node={state.rootNode} currentSelectedPath={state.editState?.path} displayConfig={displayConfig} onEdit={onEdit} path={[]}/>
            </div>
          </div>
        </div>

        <div className="columns my-3">
          <div className="column">
            <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="button is-fullwidth">
              {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
            </button>
          </div>
          <div className="column">
            <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
          </div>
        </div>
      </div>
      <div className="column">
        {state.editState && editConfig && editConfig.edit && editConfig.edit({
          ...state.editState,
          updateNode,
          jumpEditableNodes,
          keyHandlingEnabled,
          setKeyHandlingEnabled
        })}
      </div>
    </div>
  );
}