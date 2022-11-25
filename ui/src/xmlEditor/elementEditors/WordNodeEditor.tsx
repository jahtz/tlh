import {XmlEditableNodeIProps} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {useEffect, useState} from 'react';
import {MorphologicalAnalysis, MultiMorphologicalAnalysisWithMultiEnclitics} from '../../model/morphologicalAnalysis';
import {MorphAnalysisOptionContainer} from '../morphAnalysisOption/MorphAnalysisOptionContainer';
import {useSelector} from 'react-redux';
import {editorKeyConfigSelector} from '../../newStore';
import {XmlElementNode} from '../../xmlModel/xmlModel';
import {MorphAnalysisOptionEditor} from '../morphAnalysisOption/MorphAnalysisOptionEditor';
import {reconstructTransliteration} from '../transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import update, {Spec} from 'immutability-helper';
import {readWordNodeData, WordNodeData} from './wordNodeData';
import {LanguageInput} from '../LanguageInput';
import {NodeEditorRightSide} from '../NodeEditorRightSide';
import {WordStringChildEditor} from './WordStringChildEditor';
import {
  SelectedMultiMorphAnalysisWithEnclitic,
  selectedMultiMorphAnalysisWithEnclitics,
  stringifyMultiMorphAnalysisWithEnclitics
} from '../../model/selectedMorphologicalAnalysis';

interface IState {
  addMorphology: boolean;
  editContent?: string;
}

export function WordNodeEditor({
  data,
  updateNode,
  keyHandlingEnabled,
  setKeyHandlingEnabled,
  rightSideProps
}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorKeyConfigSelector);

  const [state, setState] = useState<IState>({addMorphology: false});

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  function handleKey(event: KeyboardEvent) {
    if (keyHandlingEnabled && editorConfig.submitChangeKeys.includes(event.key)) {
      rightSideProps.initiateSubmit();
    }
  }

  function toggleAnalysisSelection(morphIndex: number, letterIndex: number | undefined, encLetterIndex: number | undefined, targetState: boolean | undefined): void {
    const action: Spec<{ selected: boolean }> = targetState !== undefined
      ? {selected: {$set: targetState}}
      : {$toggle: ['selected']};

    if (letterIndex || letterIndex === 0) {
      // Multi morph
      if (encLetterIndex !== undefined) {
        // TODO: Multi enclitics

        const x = selectedMultiMorphAnalysisWithEnclitics(
          morphIndex + 1,
          String.fromCharCode('a'.charCodeAt(0) + letterIndex),
          String.fromCharCode('R'.charCodeAt(0) + encLetterIndex)
        );

        const str = stringifyMultiMorphAnalysisWithEnclitics(x);

        const innerSpec: Spec<MultiMorphologicalAnalysisWithMultiEnclitics> = {
          selectedAnalysisCombinations: {
            $apply: (selectedLetters: SelectedMultiMorphAnalysisWithEnclitic[]) => selectedLetters.map(stringifyMultiMorphAnalysisWithEnclitics).includes(str)
              ? selectedLetters.filter((s) => stringifyMultiMorphAnalysisWithEnclitics(s) !== str)
              : [...selectedLetters, x]
          }
        };

        updateNode({morphologies: {[morphIndex]: innerSpec}});
      } else {
        // Single or no enclitics
        updateNode({morphologies: {[morphIndex]: {analysisOptions: {[letterIndex]: action}}}});
      }
    } else {
      // Single morph
      if (encLetterIndex !== undefined) {
        // Multi enclitics
        updateNode({morphologies: {[morphIndex]: {encliticsAnalysis: {analysisOptions: {[encLetterIndex]: action}}}}});
      } else {
        // Single or no enclitics
        updateNode({morphologies: {[morphIndex]: action}});
      }
    }
  }

  function enableEditWordState(): void {
    setKeyHandlingEnabled(false);

    const newValue = data.node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

    setState((state) => update(state, {editContent: {$set: newValue}}));
  }

  function handleEditUpdate(node: XmlElementNode): void {
    updateNode({$set: readWordNodeData(node)});
    cancelEdit();
  }

  function cancelEdit(): void {
    setKeyHandlingEnabled(true);
    setState((state) => update(state, {editContent: {$set: undefined}}));
  }

  function updateMorphology(index: number, newMa: MorphologicalAnalysis): void {
    updateNode({morphologies: {[index]: {$set: newMa}}});
    setState((state) => update(state, {addMorphology: {$set: false}}));
  }

  function toggleAddMorphology(): void {
    setKeyHandlingEnabled(state.addMorphology);
    setState((state) => update(state, {$toggle: ['addMorphology']}));
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(0, ...data.morphologies.map(({number}) => number)) + 1;

    return {number, translation: '', referenceWord: '', analysisOptions: [], encliticsAnalysis: undefined, determinative: undefined, paradigmClass: ''};
  }

  function updateAttribute(name: string, value: string | undefined): void {
    updateNode((state) => update(state, {node: {attributes: {[name]: {$set: value}}}}));
  }

  const setEditingQuestion = (value: string | undefined) => updateAttribute('editingQuestion', value);
  const removeEditingQuestion = () => setEditingQuestion(undefined);

  function setFootNote(value: string): void {
    updateNode((state) => update(state, {footNote: {$set: value}}));
  }

  function removeFootNote(): void {
    updateNode((state) => update(state, {$unset: ['footNote']}));
  }

  const otherButtons = (
    <>
      <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={toggleAddMorphology} title={t('addMorphologicalAnalysis')}>
        +
      </button>

      <button type="button" className="ml-2 px-2 rounded bg-blue-500 text-white" onClick={enableEditWordState} title={t('editContent')}>
        &#9998;
      </button>
    </>
  );

  return (
    <NodeEditorRightSide {...rightSideProps} otherButtons={otherButtons}>
      {(state.editContent || typeof state.editContent === 'string')
        ? <WordContentEditor initialTransliteration={state.editContent} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>
        : (
          <>
            <div className="mt-4">
              <LanguageInput initialValue={data.node.attributes.lg} onChange={(lg) => updateAttribute('lg', lg.trim() || '')}/>
            </div>

            <div className="mt-4">
              <WordStringChildEditor value={data.node.attributes.editingQuestion} set={setEditingQuestion} remove={removeEditingQuestion}
                                     isEditingQuestion={true} setKeyHandlingEnabled={setKeyHandlingEnabled}
                                     strings={{add: t('addEditingQuestion'), placeHolder: t('editingQuestion')}}/>
            </div>

            <div className="mt-4">
              <WordStringChildEditor value={data.footNote} set={setFootNote} remove={removeFootNote} setKeyHandlingEnabled={setKeyHandlingEnabled}
                                     isEditingQuestion={false} strings={{add: t('addFootNote'), placeHolder: t('footNote')}}/>
            </div>

            <div className="mt-4">
              {data.morphologies.length === 0
                ? <div>
                  <div className="p-4 rounded bg-amber-400 text-center">{t('noMorphologicalAnalysesFound')}</div>

                  {data.node.attributes.mrp0sel === 'DEL'
                    ? <div className="mt-2 p-2 rounded bg-blue-600 text-white text-center w-full">mrp0sel=&quot;DEL&quot;</div>
                    : (
                      <button type="button" className="mt-2 p-2 rounded border border-slate-500 text-center w-full"
                              onClick={() => updateAttribute('mrp0sel', 'DEL')}>
                        {t('set_mrp0sel=DEL')}
                      </button>
                    )}
                </div>
                : data.morphologies.map((m, index) => <div className="mt-2" key={m.number}>
                    <MorphAnalysisOptionContainer
                      morphologicalAnalysis={m}
                      toggleAnalysisSelection={(letterIndex, encLetterIndex, targetState) => toggleAnalysisSelection(index, letterIndex, encLetterIndex, targetState)}
                      updateMorphology={(newMa) => updateMorphology(index, newMa)}
                      setKeyHandlingEnabled={setKeyHandlingEnabled}
                    />
                  </div>
                )}

              {state.addMorphology && <MorphAnalysisOptionEditor
                morphologicalAnalysis={nextMorphAnalysis()}
                onSubmit={(newMa) => updateMorphology(data.morphologies.length, newMa)}
                cancelUpdate={toggleAddMorphology}/>}
            </div>
          </>
        )}
    </NodeEditorRightSide>
  );
}
