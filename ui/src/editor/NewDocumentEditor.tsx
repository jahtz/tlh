import {useEffect, useState} from 'react';
import {findFirstXmlElementByTagName, isXmlElementNode, XmlElementNode, XmlNode} from './xmlModel/xmlModel';
import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './xmlDisplayConfigs';
import {tlhEditorConfig} from './tlhEditorConfig';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../store/store';
import {writeNode} from './xmlModel/xmlWriting';
import update, {Spec} from 'immutability-helper';
import {Prompt} from 'react-router-dom';
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

interface IEditNodeState {
  node: XmlElementNode;
  path: number[];
}

interface IAddNodeState {
  tagName: string;
  insertablePositions: InsertablePositions;
}

type EditorState = IEditNodeState | IAddNodeState;

interface IState {
  keyHandlingEnabled: boolean;
  rootNode: XmlNode;
  editorState?: EditorState;
  changed: boolean;
  author?: string;
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

export function NewDocumentEditor({node: initialNode, editorConfig = tlhEditorConfig, download, filename, closeFile}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorKeyConfig = useSelector(editorKeyConfigSelector);
  const [state, setState] = useState<IState>({keyHandlingEnabled: true, rootNode: initialNode, changed: false});


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
        $apply: (editorState) => editorState && 'path' in editorState && editorState.path.join('.') === path.join('.') ?
          undefined
          : {node, path}
      }
    }));
  }

  function updateNode(node: XmlElementNode, path: number[]): void {
    setState((state) => update(state, {
        rootNode: path.reduceRight<Spec<XmlNode>>(
          (acc, index) => ({children: {[index]: acc}}),
          {$set: node}
        ),
        changed: {$set: true}
      })
    );
  }

  function jumpEditableNodes(tagName: string, forward: boolean): void {
    if (state.editorState && 'path' in state.editorState) {
      const currentPath = state.editorState.path;

      const path = searchEditableNode(tagName, state.rootNode as XmlElementNode, currentPath, forward);
      if (path) {
        const node = findElement(state.rootNode as XmlElementNode, path);

        setState((state) => update(state, {editorState: {$set: {node, path}}}));
      }
    }
  }

  function handleJumpKey(event: KeyboardEvent): void {
    if (state.editorState && 'path' in state.editorState && state.keyHandlingEnabled) {
      if (editorKeyConfig.nextEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editorState.node.tagName, true);
      } else if (editorKeyConfig.previousEditableNodeKeys.includes(event.key)) {
        jumpEditableNodes(state.editorState.node.tagName, false);
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

  function renderNodeEditor(editState: IEditNodeState): JSX.Element {
    return (editorConfig[editState.node.tagName] as XmlSingleEditableNodeConfig).edit({
      ...editState,
      updateNode: (node) => updateNode(node, editState.path),
      deleteNode: () => deleteNode(editState.path),
      initiateJumpElement: (forward) => jumpEditableNodes(editState.node.tagName, forward),
      jumpEditableNodes,
      setKeyHandlingEnabled: (value) => setState((state) => update(state, {keyHandlingEnabled: {$set: value}})),
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
        editorState: {$set: {path, node}},
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
      <Prompt when={state.changed} message={t('leaveUnfinishedChangesMessage')}/>

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