import {JSX, useState} from 'react';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {parseNewXml, XmlElementNode} from 'simple_xml';
import classNames from 'classnames';
import {writeXml} from './StandAloneOXTED';
import update from 'immutability-helper';
import {FontSizeSelector} from './FontSizeSelector';
import {NodePath} from './insertablePositions';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {XmlSourceEditor} from './XmlSourceEditor';

export interface EditorLeftSideProps extends NodeDisplayIProps {
  filename: string;
  onNodeSelect: (node: XmlElementNode, path: NodePath) => void;
  updateNode: (node: XmlElementNode) => void;
  setKeyHandlingEnabled: (value: boolean) => void;
  closeFile: (() => void) | undefined;
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
  insertionData,
  updateNode,
  setKeyHandlingEnabled,
  closeFile
}: EditorLeftSideProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({fontSize: 100, useSerifFont: false, xmlSource: undefined});

  function activateShowSource(): void {
    setKeyHandlingEnabled(false);
    setXmlSource(writeXml(node as XmlElementNode, true));
  }

  function deactivateShowSource(): void {
    setKeyHandlingEnabled(true);
    setXmlSource(undefined);
  }

  const setXmlSource = (value: string | undefined): void => setState((state) => update(state, {xmlSource: {$set: value}}));

  const onXmlSourceUpdate = (): void => parseNewXml(state.xmlSource as string, tlhXmlEditorConfig.readConfig)
    .handle(
      (rootNode) => {
        updateNode(rootNode as XmlElementNode);
        deactivateShowSource();
      },
      (value) => alert(value)
    );


  const changeFontSize = (delta: number): void => setState((state) => update((state), {fontSize: {$apply: (value) => value + delta}}));

  return (
    <div className="flex flex-col h-full min-h-full max-h-full">
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <span className="font-bold">{filename}</span>

        <div className="float-right space-x-2">
          <FontSizeSelector currentFontSize={state.fontSize} updateFontSize={changeFontSize}/>

          {state.xmlSource
            ? (
              <>
                <button className="px-2 rounded bg-red-500 text-white font-bold" onClick={deactivateShowSource} title={t('cancelEditXmlSource')}>
                  &#x270E;
                </button>
                <button className="px-2 rounded bg-blue-500 text-white font-bold" onClick={onXmlSourceUpdate} title={t('applyXmlSourceChange')}>
                  &#x270E;
                </button>
              </>
            )
            : (
              <>
                <button onClick={() => setState((state) => update(state, {useSerifFont: {$apply: (use) => !use}}))}
                        className="mr-2 px-2 border border-slate-500 rounded">
                  {state.useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
                </button>
                <button className="px-2 rounded bg-blue-500 text-white font-bold" onClick={activateShowSource} title={t('editSource') || 'editSource'}>
                  &#x270E;
                </button>
              </>
            )}

          {closeFile && <button className="px-2 rounded bg-red-600 text-white font-bold" onClick={closeFile} title={t('closeFile') || 'closeFile'}>
            &#10799;
          </button>}
        </div>
      </div>

      <div className="flex p-4 rounded-b border border-slate-300 shadow-md flex-auto overflow-auto">
        {state.xmlSource
          ? <XmlSourceEditor style={{fontSize: `${state.fontSize}%`}} source={state.xmlSource} onChange={setXmlSource}/>
          : (
            <div className={classNames(state.useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${state.fontSize}%`}}>
              <NodeDisplay rootNode={node as XmlElementNode} node={node} currentSelectedPath={currentSelectedPath} onSelect={onNodeSelect}
                           insertionData={insertionData} isLeftSide={true}/>
            </div>
          )}
      </div>
    </div>
  );
}