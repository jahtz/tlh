import {ReactElement, useEffect, useState} from 'react';
import {isXmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../newStore';
import update, {Spec} from 'immutability-helper';
import {EditorLeftSide, EditorLeftSideProps} from './EditorLeftSide';
import {EditorEmptyRightSide} from './EditorEmptyRightSide';
import {calculateInsertablePositions, InsertablePositions, NodePath} from './insertablePositions';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {addNodeEditorState, compareChangesEditorState, defaultRightSideState, editNodeEditorState, EditorState, IEditNodeEditorState} from './editorState';
import {XmlComparator} from '../xmlComparator/XmlComparator';
import {NodeEditorRightSide} from './NodeEditorRightSide';
import {FontSizeSelectorProps} from './FontSizeSelector';
import {writeXml} from './StandAloneOXTED';
import {fetchCuneiform} from './elementEditors/LineBreakEditor';
import {getPriorSiblingPath} from '../nodeIterators';

export function buildActionSpec(innerAction: Spec<XmlNode>, path: number[]): Spec<XmlNode> {
  return path.reduceRight(
    (acc, index) => ({children: {[index]: acc}}),
    innerAction
  );
}

interface IProps {
  node: XmlNode;
  editorConfig?: XmlEditorConfig;
  filename: string;
  closeFile?: () => void;
  autoSave?: (rootNode: XmlNode) => void;
  exportName?: string;
  exportDisabled?: boolean;
  onExport: (node: XmlElementNode) => void;
  children?: ReactElement;
}

interface IState {
  keyHandlingEnabled: boolean;
  rootNode: XmlNode;
  editorState: EditorState;
  changed: boolean;
  author?: string;
  rightSideFontSize: number;
  lbCuneiformDirtyPath?: number[];
}

function searchEditableNode(tagName: string, rootNode: XmlElementNode, currentPath: number[], forward: boolean): number[] | undefined {

  const go = (node: XmlElementNode, currentPath: number[]): number[] | undefined => {
    if (node.tagName === tagName) {
      return [];
    }

    const [pathHead, ...pathTail] = currentPath;

    let firstSearch: number;
    if (currentPath.length > 0) {
      firstSearch = pathTail.length === 0 ? (forward ? pathHead + 1 : pathHead - 1) : pathHead;
    } else {
      firstSearch = forward ? 0 : node.children.length - 1;
    }

    for (let i = firstSearch; i < node.children.length && i >= 0; forward ? i++ : i--) {
      const child = node.children[i];

      const pathRest = i === pathHead ? pathTail : [];

      const foundChild = isXmlElementNode(child)
        ? go(child, pathRest)
        : undefined;

      if (foundChild) {
        return [i, ...foundChild];
      }
    }
  };

  return go(rootNode, currentPath);
}

const findElement = (node: XmlElementNode, path: number[]): XmlElementNode =>
  path.reduce((nodeToUpdate, pathContent) => nodeToUpdate.children[pathContent] as XmlElementNode, node);

const buildSpec = (path: number  [], innerSpec: Spec<XmlNode>) => path.reduceRight<Spec<XmlNode>>(
  (acc, index) => ({children: {[index]: acc}}),
  innerSpec
);

export function XmlDocumentEditor({
  node: initialNode,
  editorConfig = tlhXmlEditorConfig,
  onExport,
  filename,
  closeFile,
  autoSave,
  exportName,
  exportDisabled,
  children
}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const editorKeyConfig = useSelector(editorKeyConfigSelector);
  const [state, setState] = useState<IState>({
    keyHandlingEnabled: true,
    rootNode: initialNode,
    editorState: defaultRightSideState,
    changed: false,
    rightSideFontSize: 100
  });

  useEffect(() => {
    state.changed && autoSave && autoSave(state.rootNode);
  }, [state]);

  useEffect(() => {
    document.addEventListener('keydown', handleJumpKey);
    return () => document.removeEventListener('keydown', handleJumpKey);
  });

  function exportXml(): void {
    setState((state) => update(state, {changed: {$set: false}}));
    onExport(state.rootNode as XmlElementNode);
  }

  const onNodeSelect = (node: XmlElementNode, path: number[]): void => setState((state) => update(state, {
    editorState: (currentEditorState) => currentEditorState._type === 'EditNodeRightState' && currentEditorState.path.join('.') === path.join('.')
      ? defaultRightSideState
      : editNodeEditorState(node, editorConfig, path)
  }));

  const applyUpdates = (nextEditablePath?: number[]): void => setState((state) => {
      if (state.editorState._type !== 'EditNodeRightState') {
        return state;
      }

      const newEditorState = nextEditablePath !== undefined
        ? editNodeEditorState(findElement(state.rootNode as XmlElementNode, nextEditablePath), editorConfig, nextEditablePath)
        : undefined;

      return update(state, {
        rootNode: buildSpec(state.editorState.path, {$set: state.editorState.node}),
        editorState: newEditorState !== undefined ? {$set: newEditorState} : {changed: {$set: false}},
        changed: {$set: true}
      });
    }
  );

  const updateEditedNode = (updateSpec: Spec<XmlElementNode>): void => setState((state) => update(state, {
    editorState: (editorState) => editorState._type === 'EditNodeRightState'
      ? update(editorState, {node: updateSpec, changed: {$set: true}})
      : editorState
  }));

  const updateAttribute = (key: string, value: string | undefined): void => updateEditedNode({attributes: {[key]: {$set: value}}});

  function jumpEditableNodes(tagName: string, forward: boolean): void {
    if (state.editorState._type !== 'EditNodeRightState') {
      return;
    }

    const path = searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, forward);

    if (!path) {
      return;
    }

    const node = findElement(state.rootNode as XmlElementNode, path);

    setState((state) => update(state, {editorState: {$set: editNodeEditorState(node, editorConfig, path)}}));
  }

  function handleJumpKey(event: KeyboardEvent): void {
    if (state.editorState._type !== 'EditNodeRightState' || !state.keyHandlingEnabled) {
      return;
    }

    const tagName = state.editorState.node.tagName;

    if (editorKeyConfig.updateAndNextEditableNodeKeys.includes(event.key)) {
      applyUpdates(
        searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, true)
      );
    } else if (editorKeyConfig.nextEditableNodeKeys.includes(event.key)) {
      jumpEditableNodes(tagName, true);
    } else if (editorKeyConfig.updateAndPreviousEditableNodeKeys.includes(event.key)) {
      applyUpdates(
        searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, false)
      );
    } else if (editorKeyConfig.previousEditableNodeKeys.includes(event.key)) {
      jumpEditableNodes(tagName, false);
    }
  }

  function deleteNode(path: number[]): void {
    if (!confirm(t('deleteThisElement'))) {
      return;
    }

    const lbCuneiformDirtyPath = findElement(state.rootNode as XmlElementNode, path).tagName === 'w'
      ? getPriorSiblingPath(state.rootNode as XmlElementNode, path, 'lb')
      : undefined;

    setState((state) => update(state, {
        rootNode: buildSpec(path.slice(0, -1), {children: {$splice: [[path[path.length - 1], 1]]}}),
        editorState: {$set: defaultRightSideState},
        changed: {$set: true},
        lbCuneiformDirtyPath: {$set: lbCuneiformDirtyPath}
      })
    );
  }

  function renderNodeEditor({node, path, changed}: IEditNodeEditorState): ReactElement {

    const fontSizeSelectorProps: FontSizeSelectorProps = {
      currentFontSize: state.rightSideFontSize,
      updateFontSize: (delta) => setState((state) => update(state, {rightSideFontSize: {$apply: (value) => value + delta}}))
    };

    const setKeyHandlingEnabled = (value: boolean) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}}));

    const config = editorConfig.nodeConfigs[node.tagName] as XmlSingleEditableNodeConfig;

    const updateOtherNode = (path: number[], spec: Spec<XmlNode>): void => setState((state) => update(state, {rootNode: buildSpec(path, spec)}));

    return (
      <NodeEditorRightSide key={path.join('.')} rootNode={state.rootNode as XmlElementNode} originalNode={node} changed={changed}
                           deleteNode={() => deleteNode(path)} applyUpdates={() => applyUpdates()}
                           cancelSelection={() => setState((state) => update(state, {editorState: {$set: defaultRightSideState}}))}
                           jumpElement={(forward) => jumpEditableNodes(node.tagName, forward)} fontSizeSelectorProps={fontSizeSelectorProps}>
        {config.edit({node, path, updateEditedNode, updateAttribute, setKeyHandlingEnabled, rootNode: state.rootNode as XmlElementNode, updateOtherNode})}
      </NodeEditorRightSide>
    );
  }

  const toggleElementInsert = (tagName: string, insertablePositions: InsertablePositions): void => setState((state) => {
      switch (state.editorState._type) {
        case 'DefaultEditorState':
          return update(state, {editorState: {$set: addNodeEditorState(tagName, insertablePositions)}});
        case 'AddNodeRightState':
          return update(state, {editorState: {$set: state.editorState.tagName !== tagName ? addNodeEditorState(tagName, insertablePositions) : defaultRightSideState}});
        case 'EditNodeRightState':
        case 'CompareChangesEditorState':
          return state;
      }
    }
  );

  const toggleCompareChanges = (): void => setState((state) => update(state, {editorState: {$set: compareChangesEditorState}}));

  const toggleDefaultMode = (): void => setState((state) => update(state, {editorState: {$set: defaultRightSideState}}));

  function initiateInsert(path: NodePath): void {
    if (state.editorState._type !== 'AddNodeRightState') {
      return;
    }

    const {newElement, insertAction} = state.editorState.insertablePositions;

    const newNode = newElement !== undefined ? newElement() : {tagName: state.editorState.tagName, attributes: {}, children: []};

    const actionSpec: Spec<XmlNode> = insertAction
      ? insertAction(path, newNode, state.rootNode as XmlElementNode)
      : buildActionSpec({children: {$splice: [[path[path.length - 1], 0, newNode]]}}, path.slice(0, -1));

    const lbCuneiformDirtyPath = newNode.tagName === 'w'
      ? getPriorSiblingPath(state.rootNode as XmlElementNode, path, 'lb')
      : undefined;

    setState((state) => update(state, {
      rootNode: actionSpec,
      editorState: {$set: editNodeEditorState(newNode, editorConfig, path)},
      changed: {$set: true},
      lbCuneiformDirtyPath: {$set: lbCuneiformDirtyPath}
    }));
  }

  const currentInsertedElement = 'tagName' in state.editorState
    ? state.editorState.tagName
    : undefined;

  const exportTitle = exportName ? exportName : t('exportXml') || 'exportXml';

  const leftSideProps: Omit<EditorLeftSideProps, 'exportTitle' | 'filename' | 'node' | 'onNodeSelect' | 'onExport'> = {
    rootNode: state.rootNode as XmlElementNode,
    currentSelectedPath: 'path' in state.editorState
      ? state.editorState.path
      : undefined,
    insertionData: 'tagName' in state.editorState
      ? {
        insertablePaths: Array.from(new Set(calculateInsertablePositions(state.editorState.insertablePositions, state.rootNode))),
        insertAsLastChildOf: state.editorState.insertablePositions.asLastChildOf || [],
        initiateInsert
      }
      : undefined,
    closeFile: closeFile
      ? () => {
        if (!state.changed || confirm(t('closeFileOnUnfinishedChangesMessage'))) {
          closeFile();
        }
      }
      : undefined,
    updateNode: (node) => setState((state) => update(state, {rootNode: {$set: node}})),
    setKeyHandlingEnabled: (value) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}})),
    isLeftSide: true
  };

  if (state.lbCuneiformDirtyPath !== undefined) {
    const path = state.lbCuneiformDirtyPath;

    fetchCuneiform(state.rootNode as XmlElementNode, path)
      .then((cuneiform) => setState((state) => update(state, {
        rootNode: buildSpec(path, {attributes: {cu: {$set: cuneiform}}}),
        lbCuneiformDirtyPath: {$set: undefined}
      })));
  }

  return state.editorState._type === 'CompareChangesEditorState'
    ? (
      <div className="container mx-auto">
        <button type="button" onClick={toggleDefaultMode} className="my-4 p-2 rounded bg-blue-500 text-white w-full">{t('close')}</button>
        <XmlComparator leftFile={{name: t('startingDocumentState'), baseContent: writeXml(initialNode as XmlElementNode)}}
                       rightFile={{name: t('currentDocumentState'), baseContent: writeXml(state.rootNode as XmlElementNode)}}/>
      </div>
    ) : (
      <div className="px-2 grid grid-cols-2 gap-4 h-full max-h-full">
        <EditorLeftSide {...leftSideProps} filename={filename} node={state.rootNode} onNodeSelect={onNodeSelect}/>

        {state.editorState._type === 'EditNodeRightState'
          ? (
            <div className="max-h-full overflow-auto" key={state.editorState.path.join('.')}>
              {renderNodeEditor(state.editorState) /* don't convert to a component! */}
            </div>
          )
          : <EditorEmptyRightSide editorConfig={editorConfig} currentInsertedElement={currentInsertedElement} toggleElementInsert={toggleElementInsert}
                                  toggleCompareChanges={toggleCompareChanges} onExport={exportXml} exportTitle={exportTitle}
                                  exportDisabled={exportDisabled || false}>{children}</EditorEmptyRightSide>}
      </div>
    );
}