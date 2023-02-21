import {useState} from 'react';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {isLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import classNames from 'classnames';
import {xml} from '@codemirror/lang-xml';
import ReactCodeMirror from '@uiw/react-codemirror';
import {writeXml} from './XmlDocumentEditor';
import update from 'immutability-helper';
import {FontSizeSelector} from './FontSizeSelector';
import {NodePath} from './insertablePositions';

export interface EditorLeftSideProps extends NodeDisplayIProps {
  filename: string;
  onNodeSelect: (node: XmlElementNode, path: NodePath) => void;
  closeFile: () => void;
  exportXml: () => void;
  updateNode: (node: XmlElementNode) => void;
  setKeyHandlingEnabled: (value: boolean) => void;
}

interface IState {
  fontSize: number;
  useSerifFont: boolean;
  xmlSource: string | undefined;
}

export function EditorLeftSide({
  filename,
  node,
  currentSelectedPath,
  onNodeSelect,
  closeFile,
  exportXml,
  insertStuff,
  updateNode,
  setKeyHandlingEnabled
}: EditorLeftSideProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({fontSize: 100, useSerifFont: false, xmlSource: undefined});

  function activateShowSource(): void {
    setKeyHandlingEnabled(false);
    setXmlSource(writeXml(node as XmlElementNode));
  }

  function deactivateShowSource(): void {
    setKeyHandlingEnabled(true);
    setXmlSource(undefined);
  }

  function setXmlSource(value: string | undefined): void {
    setState((state) => update(state, {xmlSource: {$set: value}}));
  }

  function onXmlSourceUpdate(): void {
    const parseResult = parseNewXml(state.xmlSource as string);

    if (isLeft(parseResult)) {
      alert(parseResult.value);
    } else {
      updateNode(parseResult.value as XmlElementNode);
      deactivateShowSource();
    }
  }

  function changeFontSize(delta: number): void {
    setState((state) => update((state), {fontSize: {$apply: (value) => value + delta}}));
  }

  return (
    <div className="flex flex-col h-full min-h-full max-h-full">
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <span className="font-bold">{filename}</span>

        <div className="float-right">
          <FontSizeSelector currentFontSize={state.fontSize} updateFontSize={changeFontSize}/>

          {state.xmlSource
            ? <>
              <button className="mr-2 px-2 rounded bg-red-500 text-white font-bold" onClick={deactivateShowSource}
                      title={t('cancelEditXmlSource') || 'cancelEditXmlSource'}>
                &#x270E;
              </button>
              <button className="mr-2 px-2 rounded bg-blue-500 text-white font-bold" onClick={onXmlSourceUpdate}
                      title={t('applyXmlSourceChange') || 'applyXmlSourceChange'}>
                &#x270E;
              </button>
            </>
            : <>
              <button onClick={() => setState((state) => update(state, {useSerifFont: {$apply: (use) => !use}}))}
                      className="mr-2 px-2 border border-slate-500 rounded">
                {state.useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
              </button>
              <button className="mr-2 px-2 rounded bg-blue-500 text-white font-bold" onClick={activateShowSource} title={t('editSource') || 'editSource'}>
                &#x270E;
              </button>
            </>}

          <button className="mr-2 px-2 rounded bg-green-400 text-white font-bold" onClick={exportXml} title={t('exportXml') || 'exportXml'}>
            &#x1F5AB;
          </button>

          <button className="px-2 rounded bg-red-600 text-white font-bold" onClick={closeFile} title={t('closeFile') || 'closeFile'}>
            &#10799;
          </button>
        </div>
      </div>

      <div className="flex p-4 rounded-b border border-slate-300 shadow-md flex-auto overflow-auto">
        {state.xmlSource
          ? <ReactCodeMirror style={{fontSize: `${state.fontSize}%`}} value={state.xmlSource} extensions={[xml()]} onChange={setXmlSource}/>
          : (
            <div className={classNames(state.useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${state.fontSize}%`}}>
              <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} onSelect={onNodeSelect} insertStuff={insertStuff} isLeftSide={true}/>
            </div>
          )}
      </div>
    </div>
  );
}