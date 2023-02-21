import {XmlEditableNodeIProps} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {MorphologicalAnalysis, MultiMorphologicalAnalysisWithMultiEnclitics} from '../../model/morphologicalAnalysis';
import {MorphAnalysisOptionContainer} from '../morphAnalysisOption/MorphAnalysisOptionContainer';
import {isXmlElementNode, lastChildNode, xmlElementNode, XmlElementNode} from 'simple_xml';
import {MorphAnalysisOptionEditor} from '../morphAnalysisOption/MorphAnalysisOptionEditor';
import {reconstructTransliteration} from '../transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import {Spec} from 'immutability-helper';
import {readWordNodeData, WordNodeData} from './wordNodeData';
import {LanguageInput} from '../LanguageInput';
import {
  SelectedMultiMorphAnalysisWithEnclitic,
  selectedMultiMorphAnalysisWithEnclitics,
  stringifyMultiMorphAnalysisWithEnclitics
} from '../../model/selectedMorphologicalAnalysis';
import {WordStringChildEditor} from './WordStringChildEditor';

// States

const defaultState: { _type: 'DefaultState' } = {_type: 'DefaultState'};

const addMorphologyState: { _type: 'AddMorphology' } = {_type: 'AddMorphology'};

const editEditingQuestionState: { _type: 'EditEditingQuestion' } = {_type: 'EditEditingQuestion'};

const editFootNoteState: { _type: 'EditFootNoteState' } = {_type: 'EditFootNoteState'};

interface EditContentState {
  _type: 'EditContent';
  editContent: string;
}

type States = typeof defaultState | typeof addMorphologyState | typeof editEditingQuestionState | typeof editFootNoteState | EditContentState;

// Component

export function WordNodeEditor({data, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<States>(defaultState);

  function toggleAnalysisSelection(morphIndex: number, letterIndex: number | undefined, encLetterIndex: number | undefined, targetState: boolean | undefined): void {
    const action: Spec<{ selected: boolean }> = targetState !== undefined
      ? {selected: {$set: targetState}}
      : {$toggle: ['selected']};

    if (letterIndex !== undefined) {
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

        updateEditedNode({morphologies: {[morphIndex]: innerSpec}});
      } else {
        // Single or no enclitics
        updateEditedNode({morphologies: {[morphIndex]: {analysisOptions: {[letterIndex]: action}}}});
      }
    } else {
      // Single morph
      if (encLetterIndex !== undefined) {
        // Multi enclitics
        updateEditedNode({morphologies: {[morphIndex]: {encliticsAnalysis: {analysisOptions: {[encLetterIndex]: action}}}}});
      } else {
        // Single or no enclitics
        updateEditedNode({morphologies: {[morphIndex]: action}});
      }
    }
  }

  function enableEditWordState(): void {
    setKeyHandlingEnabled(false);

    const editContent = data.node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

    setState({_type: 'EditContent', editContent});
  }

  function handleEditUpdate(node: XmlElementNode): void {
    updateEditedNode({$set: readWordNodeData(node)});
    cancelEdit();
  }

  function cancelEdit(): void {
    setKeyHandlingEnabled(true);
    setState(defaultState);
  }

  function updateMorphology(index: number, newMa: MorphologicalAnalysis): void {
    updateEditedNode({morphologies: {[index]: {$set: newMa}}});
    setState(defaultState);
  }

  function toggleAddMorphology(): void {
    setKeyHandlingEnabled(state._type === 'AddMorphology');
    setState(state._type === 'AddMorphology' ? defaultState : addMorphologyState);
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    return {
      _type: 'MultiMorphAnalysisWithoutEnclitics',
      number: Math.max(0, ...data.morphologies.map(({number}) => number)) + 1,
      translation: '',
      referenceWord: '',
      analysisOptions: [],
      encliticsAnalysis: undefined,
      determinative: undefined,
      paradigmClass: ''
    };
  }

  const updateAttribute = (name: string, value: string | undefined): void => updateEditedNode({node: {attributes: {[name]: {$set: value}}}});

  // editing question

  const isAddingEditingQuestion = state === editEditingQuestionState;

  const setEditingQuestion = (value: string | undefined) => updateAttribute('editingQuestion', value);

  const onEditingQuestionSubmit = (value: string): void => {
    setEditingQuestion(value);
    setState(defaultState);
  };

  const onEditEditingQuestionButtonClick = (): void => setState((oldState) => oldState === editEditingQuestionState ? defaultState : editEditingQuestionState);

  const onRemoveEditingQuestion = (): void => {
    setEditingQuestion(undefined);
    setState(defaultState);
  };

  // footnote

  const isAddingFootNote = state === editFootNoteState;

  const lastChild = lastChildNode(data.node);

  const footNote = lastChild !== undefined && isXmlElementNode(lastChild) && lastChild.tagName === 'note'
    ? lastChild.attributes.c
    : undefined;

  const onEditFootNoteButtonClick = (): void => setState((oldState) => oldState === editFootNoteState ? defaultState : editFootNoteState);

  const addOrUpdateFootNote = (value: string): void => updateEditedNode(
    footNote === undefined
      ? {node: {children: {$push: [xmlElementNode('note', {c: value})]}}}
      : {node: {children: {[data.node.children.length - 1]: {attributes: {c: {$set: value}}}}}});

  const onFootNoteSubmit = (value: string): void => {
    addOrUpdateFootNote(value);
    setState(defaultState);
  };

  const onRemoveFootNote = (): void => {
    if (footNote !== undefined) {
      updateEditedNode({node: {children: {$splice: [[data.node.children.length - 1, 1]]}}});
    }
    setState(defaultState);
  };

  // Html

  return state._type === 'EditContent'
    ? <WordContentEditor initialTransliteration={state.editContent} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>
    : (
      <>
        <div className="mt-2">
          <LanguageInput initialValue={data.node.attributes.lg} onChange={(lg) => updateAttribute('lg', lg.trim() || '')}
                         onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}/>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={enableEditWordState} title={t('editContent') || 'editContent'}>
            &#9998; {t('editContent')}
          </button>
          <button type="button" onClick={onEditEditingQuestionButtonClick} className="p-2 rounded bg-teal-400 text-white w-full">
            &#10068; {t('editEditingQuestion')}
          </button>
          <button type="button" onClick={onEditFootNoteButtonClick} className="p-2 rounded bg-slate-400 text-white w-full">
            {t('editFootNote')}
          </button>
        </div>

        {isAddingEditingQuestion &&
          <WordStringChildEditor title={t('editingQuestion')} initialValue={data.node.attributes.editingQuestion} onDelete={onRemoveEditingQuestion}
                                 onCancel={() => setState(defaultState)} onSubmit={onEditingQuestionSubmit}
                                 onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}/>}

        {isAddingFootNote &&
          <WordStringChildEditor title={t('footNote')} initialValue={footNote} onDelete={onRemoveFootNote} onCancel={() => setState(defaultState)}
                                 onSubmit={onFootNoteSubmit} onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}/>}

        {data.node.attributes.editingQuestion && /* TODO: styling... */
          <div className="p-2 text-center">{t('editingQuestion')}: {data.node.attributes.editingQuestion}!</div>}

        {footNote && /* TODO: styling... */ <div className="p-2 text-center">{t('footNote')}: {footNote}</div>}

        <hr className="my-2"/>

        <section>
          <h2 className="mb-2 font-bold text-center">
            {t('morphologicalAnalysis_plural')}
            {data.node.attributes.mrp0sel !== undefined && <span>(mrp0sel=&quot;{data.node.attributes.mrp0sel}&quot;)</span>}
          </h2>

          {data.morphologies.length === 0
            ? (
              <div>
                <div className="p-2 rounded bg-amber-400 text-center">{t('noMorphologicalAnalysesFound')}</div>

                {data.node.attributes.mrp0sel === 'DEL'
                  ? <div className="mt-2 p-2 rounded bg-blue-600 text-white text-center w-full">mrp0sel=&quot;DEL&quot;</div>
                  : (
                    <button type="button" className="mt-2 p-2 rounded border border-slate-500 text-center w-full"
                            onClick={() => updateAttribute('mrp0sel', 'DEL')}>
                      {t('set_mrp0sel=DEL')}
                    </button>
                  )}
              </div>
            )
            : data.morphologies.map((m, index) => <div className="mt-2" key={m.number}>
                <MorphAnalysisOptionContainer
                  morphologicalAnalysis={m}
                  toggleAnalysisSelection={(letterIndex, encLetterIndex, targetState) => toggleAnalysisSelection(index, letterIndex, encLetterIndex, targetState)}
                  updateMorphology={(newMa) => updateMorphology(index, newMa)}
                  setKeyHandlingEnabled={setKeyHandlingEnabled}
                />
              </div>
            )}

          {state === addMorphologyState
            ? <MorphAnalysisOptionEditor initialMorphologicalAnalysis={nextMorphAnalysis()}
                                         onSubmit={(newMa) => updateMorphology(data.morphologies.length, newMa)}
                                         cancelUpdate={toggleAddMorphology}/>
            : (
              <button type="button" className="mt-4 p-2 rounded bg-cyan-300 text-white w-full" onClick={toggleAddMorphology}>
                {t('addMorphologicalAnalysis')}
              </button>
            )}
        </section>
      </>
    );
}
