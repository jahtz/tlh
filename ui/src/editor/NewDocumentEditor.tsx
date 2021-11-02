import React, {useEffect, useState} from 'react';
import {isXmlElementNode, XmlElementNode, XmlNode} from './xmlModel/xmlModel';
import {EditTriggerFunc, UpdateNodeFunc, XmlNodeDisplayConfigObject} from './xmlDisplayConfigs';
import {tlhNodeDisplayConfig} from './tlhNodeDisplayConfig';
import {NodeDisplay} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorConfigSelector} from '../store/store';
import classNames from 'classnames';
import {writeNode} from './xmlModel/xmlWriting';
import {BulmaCard} from '../bulmaHelpers/BulmaCard';
import update, {Spec} from 'immutability-helper';

interface IProps {
  node: XmlNode;
  filename: string;
  displayConfig?: XmlNodeDisplayConfigObject;
  download: (content: string) => void;
  closeFile: () => void;
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

export function NewDocumentEditor({node: initialNode, displayConfig = tlhNodeDisplayConfig, download, filename, closeFile}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorConfigSelector);
  const [state, setState] = useState<IState>({rootNode: initialNode});
  const [keyHandlingEnabled, setKeyHandlingEnabled] = useState(true);
  const [useSerifFont, setUseSerifFont] = useState(false);

  useEffect(() => {
    document.addEventListener('keydown', handleJumpKey);
    return () => document.removeEventListener('keydown', handleJumpKey);
  });

  const onEdit: EditTriggerFunc = (node, path) => setState((state) => update(state, {editState: {$set: {node, path}}}));

  const updateNode: UpdateNodeFunc = (node, path) => setState((state) => update(state, {
      rootNode: path.reduceRight<Spec<XmlNode>>(
        (acc, index) => ({children: {[index]: acc}}),
        {$set: node}
      )
    })
  );

  function exportXml(): void {
    download(
      writeNode(state.rootNode)
        .join('\n')
        .replaceAll('®', '\n\t')
        .replaceAll('{', '\n\t\t{')
        .replaceAll('+=', '\n\t\t   += ')
        .replaceAll('<w', '\n <w')
        .replaceAll('<lb', '\n\n<lb')
        .replaceAll(' mrp', '\n\tmrp')
        .replaceAll('@', ' @ ')
    );
  }

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

  function handleJumpKey(event: KeyboardEvent): void {
    if (state.editState && keyHandlingEnabled) {
      if (editorConfig.nextEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editState.node.tagName, true);
      } else if (editorConfig.previousEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editState.node.tagName, false);
      }
    }
  }

  function deleteNode(path: number[]): void {
    setState((state) => update(state, {
        rootNode: path.slice(0, -1).reduceRight<Spec<XmlNode>>(
          (acc, index) => ({children: {[index]: acc}}),
          {children: {$splice: [[path[path.length - 1], 1]]}}
        ),
        editState: {$set: undefined}
      })
    );
  }

  function rightSide(): JSX.Element | undefined {
    if (state.editState) {
      const editState = state.editState;

      const editConfig = displayConfig[editState.node.tagName];

      return editConfig && editConfig.edit && editConfig.edit({
        ...editState,
        updateNode: (node) => updateNode(node, editState.path),
        deleteNode: () => deleteNode(editState.path),
        jumpEditableNodes,
        keyHandlingEnabled,
        setKeyHandlingEnabled,
        initiateJumpElement: (forward) => jumpEditableNodes(editState.node.tagName, forward)
      });
    }
  }

  return (
    <div className="columns">

      <div className="column">
        <BulmaCard title={filename}>
          <div className={classNames('scrollable', useSerifFont ? 'font-hpm-serif' : 'font-hpm')}>
            <NodeDisplay node={state.rootNode} currentSelectedPath={state.editState?.path} displayConfig={displayConfig} onEdit={onEdit}/>
          </div>
        </BulmaCard>

        <div className="columns my-3">
          <div className="column">
            <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="button is-fullwidth">
              {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
            </button>
          </div>
          <div className="column">
            <button className="button is-fullwidth" onClick={closeFile}>{t('closeFile')}</button>
          </div>
          <div className="column">
            <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
          </div>
        </div>

      </div>

      <div className="column">
        {rightSide()}
      </div>
    </div>
  );
}