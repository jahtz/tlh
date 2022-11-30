import {useEffect, useState} from 'react';
import {buildActionSpec, findFirstXmlElementByTagName, isXmlElementNode, XmlElementNode, XmlNode} from '../xmlModel/xmlModel';
import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../newStore';
import {writeNode} from '../xmlModel/xmlWriting';
import update, {Spec} from 'immutability-helper';
import {EditorLeftSide, EditorLeftSideProps} from './EditorLeftSide';
import {EditorEmptyRightSide} from './EditorEmptyRightSide';
import {calculateInsertablePositions, InsertablePositions, NodePath} from './insertablePositions';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {addNodeEditorState, compareChangesEditorState, defaultRightSideState, editNodeEditorState, EditorState, IEditNodeEditorState} from './editorState';
import {ReadFile} from '../xmlComparator/XmlComparatorContainer';
import {XmlComparator} from '../xmlComparator/XmlComparator';

interface IProps {
  node: XmlNode;
  editorConfig: XmlEditorConfig;
  filename: string;
  download: (content: string) => void;
  closeFile: () => void;
  autoSave: (rootNode: XmlNode) => void;
}

interface IState<T> {
  keyHandlingEnabled: boolean;
  rootNode: XmlNode;
  editorState: EditorState<T>;
  changed: boolean;
  author?: string;
  rightSideFontSize: number;
}

function searchEditableNode(
  tagName: string,
  rootNode: XmlElementNode,
  currentPath: number[],
  forward: boolean,
): number[] | undefined {
  // FIXME: ignore nodes...

  function go(node: XmlElementNode, currentPath: number[]): number[] | undefined {

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
  }

  return go(rootNode, currentPath);
}

function findElement(node: XmlElementNode, path: number[]): XmlElementNode {
  return path.reduce<XmlElementNode>((nodeToUpdate, pathContent) => nodeToUpdate.children[pathContent] as XmlElementNode, node);
}

function addAuthorNode(rootNode: XmlElementNode, editor: string): XmlElementNode {

  const annotationNode = findFirstXmlElementByTagName(rootNode, 'annotation');

  if (!annotationNode) {
    throw new Error('No annotation node found!');
  }

  annotationNode.children.push({
    tagName: 'annot',
    attributes: {
      editor, data: (new Date).toISOString()
    },
    children: []
  });

  return rootNode;
}


export function writeXml(node: XmlElementNode, editorConfig: XmlEditorConfig = tlhXmlEditorConfig): string {
  const nodeToExport = editorConfig.beforeExport(node);

  const exported = writeNode(nodeToExport);

  return editorConfig.afterExport(exported.join('\n'));
}

export function XmlDocumentEditor<T>({node: initialNode, editorConfig, download, filename, closeFile, autoSave}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorKeyConfig = useSelector(editorKeyConfigSelector);
  const [state, setState] = useState<IState<T>>({
    keyHandlingEnabled: true,
    rootNode: initialNode,
    editorState: defaultRightSideState,
    changed: false,
    rightSideFontSize: 100
  });

  useEffect(() => {
    state.changed && autoSave(state.rootNode);
  }, [state]);

  useEffect(() => {
    document.addEventListener('keydown', handleJumpKey);
    return () => document.removeEventListener('keydown', handleJumpKey);
  });

  function exportXml(): void {
    // FIXME: add annot node...
    let author: string | null | undefined = state.author;

    if (!author) {
      author = prompt(t('authorAbbreviation?'));

      if (!author) {
        alert(t('noExportWithoutAuthor'));
        return;
      }

      setState((state) => update(state, {author: {$set: author as string}}));
    }

    const toExport = addAuthorNode(state.rootNode as XmlElementNode, author);

    setState((state) => update(state, {changed: {$set: false}}));

    download(
      writeXml(toExport, editorConfig)
    );
  }

  function onNodeSelect(node: XmlElementNode, path: number[]): void {
    setState((state) => update(state, {
      editorState: {
        $apply: (editorState) => editorState._type === 'EditNodeRightState' && editorState.path.join('.') === path.join('.')
          ? defaultRightSideState
          : editNodeEditorState(node, editorConfig, path)
      }
    }));
  }

  function updateNode(nextEditablePath?: number[]): void {
    let newEditorState: IEditNodeEditorState<T> | undefined = undefined;

    if (nextEditablePath) {
      const node = findElement(state.rootNode as XmlElementNode, nextEditablePath);

      if (state.editorState && 'path' in state.editorState) {
        newEditorState = editNodeEditorState(node, editorConfig, nextEditablePath);
      }
    }

    setState((state) => state.editorState._type === 'EditNodeRightState'
      ? update(state, {
        rootNode: state.editorState.path.reduceRight<Spec<XmlNode>>(
          (acc, index) => ({children: {[index]: acc}}),
          {$set: (editorConfig.nodeConfigs[state.editorState.node.tagName] as XmlSingleEditableNodeConfig<T>).writeNode(state.editorState.data, state.editorState.node)}
        ),
        editorState: newEditorState
          ? {$set: newEditorState}
          : {changed: {$set: false}},
        changed: {$set: true}
      })
      : state
    );
  }

  function updateEditedNode(updateSpec: Spec<T>): void {
    setState((state) => update(state, {
      editorState: {
        $apply: (editorState) => editorState && 'path' in editorState
          ? update(editorState, {data: updateSpec, changed: {$set: true}})
          : editorState
      }
    }));
  }

  function jumpEditableNodes(tagName: string, forward: boolean): void {
    if (state.editorState && 'path' in state.editorState) {
      const currentPath = state.editorState.path;

      const path = searchEditableNode(tagName, state.rootNode as XmlElementNode, currentPath, forward);
      if (path) {
        const node = findElement(state.rootNode as XmlElementNode, path);

        setState((state) => update(state, {editorState: {$set: editNodeEditorState(node, editorConfig, path)}}));
      }
    }
  }

  function handleJumpKey(event: KeyboardEvent): void {
    if (state.editorState && 'path' in state.editorState && state.keyHandlingEnabled) {

      const tagName = state.editorState.node.tagName;

      if (editorKeyConfig.updateAndNextEditableNodeKeys.includes(event.key)) {
        // FIXME: update and jump...
        updateNode(
          searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, true)
        );
      } else if (editorKeyConfig.nextEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(tagName, true);
      } else if (editorKeyConfig.updateAndPreviousEditableNodeKeys.includes(event.key)) {
        // FIXME: update and jump...
        updateNode(
          searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, false)
        );
      } else if (editorKeyConfig.previousEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(tagName, false);
      }
    }
  }

  function deleteNode(path: number[]): void {
    if (confirm(t('deleteThisElement'))) {
      setState((state) => update(state, {
          rootNode: path.slice(0, -1).reduceRight<Spec<XmlNode>>(
            (acc, index) => ({children: {[index]: acc}}),
            {children: {$splice: [[path[path.length - 1], 1]]}}
          ),
          editorState: {$set: defaultRightSideState},
          changed: {$set: true}
        })
      );
    }
  }

  function renderNodeEditor({node, data, path, changed}: IEditNodeEditorState<T>): JSX.Element {
    return (editorConfig.nodeConfigs[node.tagName] as XmlSingleEditableNodeConfig<T>).edit({
      rightSideProps: {
        originalNode: node,
        deleteNode: () => deleteNode(path),
        changed,
        initiateSubmit: () => updateNode(),
        fontSizeSelectorProps: {
          currentFontSize: state.rightSideFontSize,
          updateFontSize: (delta) => setState((state) => update(state, {rightSideFontSize: {$apply: (value) => value + delta}}))
        },
        cancelSelection: () => setState((state) => update(state, {editorState: {$set: defaultRightSideState}})),
        jumpElement: (forward) => jumpEditableNodes(node.tagName, forward)
      },
      data,
      path,
      updateNode: (data) => updateEditedNode(data),
      initiateJumpElement: (forward) => jumpEditableNodes(node.tagName, forward),
      keyHandlingEnabled: state.keyHandlingEnabled,
      setKeyHandlingEnabled: (value) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}})),
    });
  }

  function toggleElementInsert(tagName: string, insertablePositions: InsertablePositions): void {
    const targetState = addNodeEditorState(tagName, insertablePositions);

    setState((state) => {
        switch (state.editorState._type) {
          case 'DefaultEditorState':
            return update(state, {editorState: {$set: targetState}});
          case 'AddNodeRightState':
            return update(state, {editorState: {$set: state.editorState.tagName !== tagName ? targetState : defaultRightSideState}});
          case 'EditNodeRightState':
          case 'CompareChangesEditorState':
            return state;
        }
      }
    );
  }

  function toggleCompareChanges(): void {
    setState((state) => update(state, {editorState: {$set: compareChangesEditorState}}));
  }

  function toggleDefaultMode(): void {
    setState((state) => update(state, {editorState: {$set: defaultRightSideState}}));
  }

  function initiateInsert(path: NodePath): void {
    if (state.editorState && 'tagName' in state.editorState) {

      const {newElement, insertAction} = state.editorState.insertablePositions;

      const newNode = newElement !== undefined ? newElement() : {tagName: state.editorState.tagName, attributes: {}, children: []};

      const actionSpec: Spec<XmlNode> = insertAction
        ? insertAction(path, newNode, state.rootNode as XmlElementNode)
        : buildActionSpec({children: {$splice: [[path[path.length - 1], 0, newNode]]}}, path.slice(0, -1));

      setState((state) => update(state, {
        rootNode: actionSpec,
        editorState: {$set: editNodeEditorState(newNode, editorConfig, path)},
        changed: {$set: true}
      }));
    }
  }

  const currentInsertedElement = state.editorState && 'tagName' in state.editorState
    ? state.editorState.tagName
    : undefined;

  const leftSideProps: EditorLeftSideProps = {
    filename,
    node: state.rootNode,
    currentSelectedPath: state.editorState && 'path' in state.editorState
      ? state.editorState.path
      : undefined,
    onNodeSelect,
    exportXml,
    insertStuff: state.editorState && 'tagName' in state.editorState
      ? {
        insertablePaths: Array.from(new Set(calculateInsertablePositions(state.editorState.insertablePositions, state.rootNode))),
        insertAsLastChildOf: state.editorState.insertablePositions.asLastChildOf || [],
        initiateInsert
      }
      : undefined,
    closeFile: () => {
      if (!state.changed || confirm(t('closeFileOnUnfinishedChangesMessage'))) {
        closeFile();
      }
    },
    updateNode: (node) => setState((state) => update(state, {rootNode: {$set: node}})),
    setKeyHandlingEnabled: (value) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}})),
    isLeftSide: true
  };

  if (state.editorState._type === 'CompareChangesEditorState') {

    const leftSide: ReadFile = {name: '', baseContent: writeNode(initialNode).join('\n')};
    const right: ReadFile = {name: '', baseContent: writeNode(state.rootNode).join('\n')};

    return (
      <div className="container mx-auto">
        <button type="button" onClick={toggleDefaultMode} className="my-4 p-2 rounded bg-blue-500 text-white w-full">{t('close')}</button>
        <XmlComparator leftFile={leftSide} rightFile={right}/>
      </div>
    );
  } else {

    return (
      <div className="px-2 grid grid-cols-2 gap-4 h-full max-h-full">
        <EditorLeftSide {...leftSideProps}/>

        {state.editorState._type === 'EditNodeRightState'
          ? (
            <div className="max-h-full overflow-auto" key={state.editorState.path.join('.')}>
              {renderNodeEditor(state.editorState) /* don't convert to a component! */}
            </div>
          )
          : <EditorEmptyRightSide editorConfig={editorConfig} currentInsertedElement={currentInsertedElement} toggleElementInsert={toggleElementInsert}
                                  toggleCompareChanges={toggleCompareChanges}/>}
      </div>
    );
  }
}