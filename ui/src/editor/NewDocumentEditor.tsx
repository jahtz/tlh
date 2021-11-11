import {useEffect, useState} from 'react';
import {findFirstXmlElementByTagName, isXmlElementNode, XmlElementNode, XmlNode} from './xmlModel/xmlModel';
import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './editorConfig/editorConfig';
import {tlhXmlEditorConfig} from './editorConfig/tlhXmlEditorConfig';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../store/store';
import {writeNode} from './xmlModel/xmlWriting';
import update, {Spec} from 'immutability-helper';
import {EditorLeftSide} from './EditorLeftSide';
import {EditorEmptyRightSide} from './EditorEmptyRightSide';
import {calculateInsertablePositions, InsertablePositions, NodePath} from './insertablePositions';
import {InsertStuff} from './NodeDisplay';

interface IProps {
  node: XmlNode;
  filename: string;
  editorConfig?: XmlEditorConfig;
  download: (content: string) => void;
  closeFile: () => void;
}

interface IEditNodeState<T> {
  node: XmlElementNode;
  data: T;
  changed: boolean;
  path: number[];
}

function editorStateIsEditNodeState<T>(s: EditorState<T>): s is IEditNodeState<T> {
  return 'path' in s;
}

interface IAddNodeState {
  tagName: string;
  insertablePositions: InsertablePositions;
}

type EditorState<T> = IEditNodeState<T> | IAddNodeState;

interface IState<T> {
  keyHandlingEnabled: boolean;
  rootNode: XmlNode;
  editorState?: EditorState<T>;
  changed: boolean;
  author?: string;
}

function searchEditableNode(
  tagName: string,
  rootNode: XmlElementNode,
  currentPath: number[],
  forward: boolean,
  ignoreNode: ((node: XmlElementNode) => boolean) | undefined
): number[] | undefined {
  // FIXME: ignore nodes...

  function go(node: XmlElementNode, currentPath: number[]): number[] | undefined {

    if (node.tagName === tagName && (!ignoreNode || !ignoreNode(node))) {
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

export function NewDocumentEditor<T>({node: initialNode, editorConfig = tlhXmlEditorConfig(), download, filename, closeFile}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorKeyConfig = useSelector(editorKeyConfigSelector);
  const [state, setState] = useState<IState<T>>({keyHandlingEnabled: true, rootNode: initialNode, changed: false});


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
      writeNode(toExport)
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

  function onNodeSelect(node: XmlElementNode, path: number[]): void {
    setState((state) => update(state, {
      editorState: {
        $apply: (editorState: EditorState<T> | undefined) => {
          const config = editorConfig[node.tagName] as XmlSingleEditableNodeConfig<T>;

          if (config.ignore && config.ignore(node)) {
            return editorState;
          } else if (editorState && editorStateIsEditNodeState(editorState) && editorState.path.join('.') === path.join('.')) {
            return undefined;
          } else {
            return {node, data: config.readNode(node), changed: false, path};
          }
        }

      }
    }));
  }

  function updateNode(nextEditablePath?: number[]): void {

    let newEditorState: IEditNodeState<T> | undefined = undefined;
    if (nextEditablePath) {

      const node = findElement(state.rootNode as XmlElementNode, nextEditablePath);

      if (state.editorState && 'path' in state.editorState) {

        newEditorState = {
          node, path: nextEditablePath, changed: false, data: (editorConfig[node.tagName] as XmlSingleEditableNodeConfig<T>).readNode(node)
        };
      }
    }

    setState((state) =>
      state.editorState && editorStateIsEditNodeState(state.editorState)
        ? update(state, {
          rootNode: state.editorState.path.reduceRight<Spec<XmlNode>>(
            (acc, index) => ({children: {[index]: acc}}),
            {$set: (editorConfig[state.editorState.node.tagName] as XmlSingleEditableNodeConfig<T>).writeNode(state.editorState.data, state.editorState.node)}
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

      const path = searchEditableNode(tagName, state.rootNode as XmlElementNode, currentPath, forward, (editorConfig[tagName] as XmlSingleEditableNodeConfig<T>).ignore);
      if (path) {
        const node = findElement(state.rootNode as XmlElementNode, path);

        setState((state) => update(state, {
          editorState: {
            $set: {
              node,
              data: (editorConfig[node.tagName] as XmlSingleEditableNodeConfig<T>).readNode(node),
              changed: false,
              path
            }
          }
        }));
      }
    }
  }

  function handleJumpKey(event: KeyboardEvent): void {
    if (state.editorState && 'path' in state.editorState && state.keyHandlingEnabled) {

      const tagName = state.editorState.node.tagName;

      if (editorKeyConfig.updateAndNextEditableNodeKeys.includes(event.key)) {
        // FIXME: update and jump...
        updateNode(
          searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, true, (editorConfig[tagName] as XmlSingleEditableNodeConfig<T>).ignore)
        );
      } else if (editorKeyConfig.nextEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(tagName, true);
      } else if (editorKeyConfig.updateAndPreviousEditableNodeKeys.includes(event.key)) {
        // FIXME: update and jump...
        updateNode(
          searchEditableNode(tagName, state.rootNode as XmlElementNode, state.editorState.path, false, (editorConfig[tagName] as XmlSingleEditableNodeConfig<T>).ignore)
        );
      } else if (editorKeyConfig.previousEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(tagName, false);
      }
    }
  }

  function deleteNode(path: number[]): void {
    setState((state) => update(state, {
        rootNode: path.slice(0, -1).reduceRight<Spec<XmlNode>>(
          (acc, index) => ({children: {[index]: acc}}),
          {children: {$splice: [[path[path.length - 1], 1]]}}
        ),
        editorState: {$set: undefined},
        changed: {$set: true}
      })
    );
  }

  function renderNodeEditor({node, data, path, changed}: IEditNodeState<T>): JSX.Element {
    return (editorConfig[node.tagName] as XmlSingleEditableNodeConfig<T>).edit({
      node,
      data,
      path,
      changed,
      updateNode: (data) => updateEditedNode(data),
      deleteNode: () => deleteNode(path),
      initiateJumpElement: (forward) => jumpEditableNodes(node.tagName, forward),
      jumpEditableNodes,
      setKeyHandlingEnabled: (value) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}})),
      initiateSubmit: () => updateNode()
    });
  }

  function onCloseFile(): void {
    if (!state.changed || confirm(t('closeFileOnUnfinishedChangesMessage'))) {
      closeFile();
    }
  }

  function toggleElementInsert(tagName: string, insertablePositions: InsertablePositions): void {
    setState((state) => {
        if (!state.editorState) {
          return update(state, {editorState: {$set: {tagName, insertablePositions}}});
        } else if (state.editorState && 'path' in state.editorState) {
          return state;
        } else {
          return update(state, {editorState: {$set: state.editorState.tagName !== tagName ? {tagName, insertablePositions} : undefined}});
        }
      }
    );
  }

  function initiateInsert(path: NodePath): void {
    if (state.editorState && 'tagName' in state.editorState) {
      const node: XmlElementNode = {tagName: state.editorState.tagName, attributes: {}, children: []};

      setState((state) => update(state, {
        rootNode: path.slice(0, -1).reduceRight<Spec<XmlNode>>(
          (acc, index) => ({children: {[index]: acc}}),
          {children: {$splice: [[path[path.length - 1], 0, node]]}}
        ),
        editorState: {$set: {path, changed: false, node, data: (editorConfig[node.tagName] as XmlSingleEditableNodeConfig<T>).readNode(node)}},
        changed: {$set: true}
      }));
    }
  }

  const currentSelectedPath = state.editorState && 'path' in state.editorState
    ? state.editorState.path
    : undefined;

  const currentInsertedElement = state.editorState && 'tagName' in state.editorState
    ? state.editorState.tagName
    : undefined;

  const insertStuff: InsertStuff | undefined = state.editorState && 'tagName' in state.editorState
    ? {insertablePaths: Array.from(new Set(calculateInsertablePositions(state.editorState.insertablePositions, state.rootNode))), initiateInsert}
    : undefined;

  return (
    <>
      {/* FIXME: propmt!
      <Prompt when={state.changed} message={t('leaveUnfinishedChangesMessage')}/>
      */}

      <div className="columns">
        <div className="column">
          <EditorLeftSide filename={filename} node={state.rootNode} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig}
                          onNodeSelect={onNodeSelect} closeFile={onCloseFile} exportXml={exportXml} insertStuff={insertStuff}/>
        </div>

        <div className="column">
          {state.editorState && 'path' in state.editorState
            ? renderNodeEditor(state.editorState) /* don't convert to a component! */
            : <EditorEmptyRightSide editorConfig={editorConfig} currentInsertedElement={currentInsertedElement} toggleElementInsert={toggleElementInsert}/>}
        </div>
      </div>
    </>
  );
}