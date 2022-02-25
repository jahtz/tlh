import {XmlEditableNodeIProps} from '../editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {useEffect, useState} from 'react';
import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {MorphAnalysisOptionContainer} from '../morphAnalysisOption/MorphAnalysisOptionContainer';
import {NodeDisplay} from '../NodeDisplay';
import {tlhXmlEditorConfig} from '../editorConfig/tlhXmlEditorConfig';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../../store/store';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {MorphAnalysisOptionEditor} from '../morphAnalysisOption/MorphAnalysisOptionEditor';
import {reconstructTransliteration} from '../transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import update, {Spec} from 'immutability-helper';
import {readWordNodeData, WordNodeData} from './wordNodeData';
import {WordQuestion} from '../wordEditor/WordQuestion';
import {WordQuestionForm} from '../wordEditor/WordQuestionForm';
import {LanguageInput} from '../LanguageInput';
import classNames from 'classnames';

interface IState {
  addMorphology?: boolean;
  editContent?: string;
}

export function WordNodeEditor({
  data,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateJumpElement,
  initiateSubmit
}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorKeyConfigSelector);

  const [state, setState] = useState<IState>({});

  const [addEditingQuestionEnabled, setAddEditingQuestionEnabled] = useState(false);
  const [isAddMorphologyState, setIsAddMorphologyState] = useState(false);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  function handleKey(event: KeyboardEvent) {
    if (editorConfig.submitChangeKeys.includes(event.key)) {
      initiateSubmit();
    }
  }

  function toggleAnalysisSelection(morphIndex: number, letterIndex?: number): void {
    const action: Spec<{ selected: boolean }> = {$toggle: ['selected']};

    if (letterIndex || letterIndex === 0) {
      updateNode({morphologies: {[morphIndex]: {analysisOptions: {[letterIndex]: action}}}});
    } else {
      updateNode({morphologies: {[morphIndex]: action}});
    }
  }

  function toggleEncliticsSelection(morphIndex: number, letterIndex: number): void {
    updateNode({morphologies: {[morphIndex]: {encliticsAnalysis: {analysisOptions: {[letterIndex]: {$toggle: ['selected']}}}}}});
  }

  function enableEditWordState(): void {
    const newValue = data.node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

    setState((state) => update(state, {editContent: {$set: newValue}}));
  }

  function handleEditUpdate(node: XmlElementNode): void {
    updateNode({$set: readWordNodeData(node)});
    cancelEdit();
  }

  function cancelEdit(): void {
    setState((state) => update(state, {editContent: {$set: undefined}}));
  }

  function updateMorphology(index: number, newMa: MorphologicalAnalysis): void {
    updateNode({morphologies: {[index]: {$set: newMa}}});
    setIsAddMorphologyState(false);
  }

  function toggleAddMorphology(): void {
    setKeyHandlingEnabled(isAddMorphologyState);
    setIsAddMorphologyState((value) => !value);
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(0, ...data.morphologies.map(({number}) => number)) + 1;

    return {number, translation: '', referenceWord: '', analysisOptions: [], paradigmClass: ''};
  }

  function updateLanguage(lg: string): void {
    updateNode((state) => update(state, {lg: {$set: lg.trim() || ''}}));
  }


  function removeNote(): void {
    updateNode((state) => update(state, {node: {attributes: {$unset: ['editingQuestion']}}}));
  }

  function addEditingQuestion(value: string): void {
    updateNode((state) => update(state, {node: {attributes: {editingQuestion: {$set: value}}}}));
    cancelAddEditingQuestion();
  }

  function cancelAddEditingQuestion(): void {
    setKeyHandlingEnabled(true);
    setAddEditingQuestionEnabled(false);
  }

  function enableAddEditingQuestion(): void {
    setKeyHandlingEnabled(false);
    setAddEditingQuestionEnabled(true);
  }

  return (
    <div>
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <NodeDisplay node={data.node} editorConfig={tlhXmlEditorConfig}/>

        <div className="float-right">
          <button type="button" className="ml-2 px-2 rounded border border-slate-500 font-bold" onClick={() => initiateJumpElement(false)}
                  title={t('previousTag')}>
            &larr;
          </button>

          <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={toggleAddMorphology} title={t('addMorphologicalAnalysis')}>
            +
          </button>

          <button type="button" className="ml-2 px-2 rounded bg-blue-500 text-white" onClick={enableEditWordState} title={t('editContent')}>
            &#9998;
          </button>

          <button type="button" className="ml-2 px-2 rounded bg-red-600 text-white" onClick={deleteNode} title={t('deleteNode')}>
            &minus;
          </button>

          <button type="button" className={classNames('ml-2', 'px-2', 'rounded', changed ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}
                  onClick={initiateSubmit} title={t('updateNode')}>
            {t('update')}
          </button>

          <button type="button" className="ml-2 px-2 rounded border border-slate-500 font-bold" onClick={() => initiateJumpElement(true)}
                  title={t('nextTag')}>
            &rarr;
          </button>
        </div>
      </div>

      <div className="p-2 rounded-b border border-slate-300">
        {(state.editContent || typeof state.editContent === 'string')
          ? <WordContentEditor initialTransliteration={state.editContent} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>
          : <>
            <div className="mt-4">
              <LanguageInput initialValue={data.lg} onBlur={updateLanguage}/>
            </div>

            <div className="mt-4">
              {data.node.attributes.editingQuestion
                ? <WordQuestion comment={data.node.attributes.editingQuestion} removeNote={removeNote}/>
                : (addEditingQuestionEnabled
                  ? <WordQuestionForm cancel={cancelAddEditingQuestion} onSubmit={addEditingQuestion}/>
                  : <button type="button" className="p-2 rounded bg-cyan-500 text-white w-full"
                            onClick={enableAddEditingQuestion}>{t('addEditingQuestion')}</button>)}
            </div>

            <div className="mt-4">
              {data.morphologies.length === 0
                ? <div className="p-4 rounded bg-amber-400 text-center">{t('noMorphologicalAnalysesFound')}</div>
                : data.morphologies.map((m, index) => <div className="mt-2" key={m.number}>
                    <MorphAnalysisOptionContainer
                      morphologicalAnalysis={m}
                      toggleAnalysisSelection={(letterIndex) => toggleAnalysisSelection(index, letterIndex)}
                      toggleEncliticsSelection={(letterIndex) => toggleEncliticsSelection(index, letterIndex)}
                      updateMorphology={(newMa) => updateMorphology(index, newMa)}
                      setKeyHandlingEnabled={setKeyHandlingEnabled}
                    />
                  </div>
                )}

              {isAddMorphologyState && <MorphAnalysisOptionEditor
                morphologicalAnalysis={nextMorphAnalysis()}
                onSubmit={(newMa) => updateMorphology(data.morphologies.length, newMa)}
                cancelUpdate={toggleAddMorphology}/>}
            </div>
          </>}

      </div>
    </div>
  );
}
