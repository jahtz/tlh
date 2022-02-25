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
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from '../morphAnalysisOption/UpdatePrevNextButtons';
import {readWordNodeData, WordNodeData} from './wordNodeData';
import {WordQuestion} from '../wordEditor/WordQuestion';
import {WordQuestionForm} from '../wordEditor/WordQuestionForm';
import {LanguageInput} from '../LanguageInput';

interface IState {
  addMorphology?: boolean;
  editContent?: string;
}

export function WordNodeEditor({
  data,
  changed,
  updateNode,
  deleteNode,
  jumpEditableNodes,
  setKeyHandlingEnabled,
  initiateJumpElement,
  initiateSubmit
}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorKeyConfigSelector);

  const [state, setState] = useState<IState>({});
  const [isAddNote, setIsAddNote] = useState(false);

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
      updateNode({
        morphologies: {
          [morphIndex]: {
            analysisOptions: {
              [letterIndex]: action
            }
          }
        }
      });
    } else {
      updateNode({
        morphologies: {
          [morphIndex]: action
        }
      });
    }
  }

  function toggleEncliticsSelection(morphIndex: number, letterIndex: number): void {
    updateNode({
      morphologies: {
        [morphIndex]: {
          encliticsAnalysis: {
            analysisOptions: {
              [letterIndex]: {$toggle: ['selected']}
            }
          }
        }
      }
    });
  }

  function enableEditWordState(): void {
    setState((state) => update(state, {
      editContent: {
        $set: data.node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('')
      }
    }));
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

  if (state.editContent || typeof state.editContent === 'string') {
    return <WordContentEditor initialTransliteration={state.editContent} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>;
  }

  function removeNote(): void {
    updateNode((state) => update(state, {node: {attributes: {$unset: ['q']}}}));
  }

  function addEditingQuestion(value: string): void {
    updateNode((state) => update(state, {node: {attributes: {editingQuestion: {$set: value}}}}));
    setIsAddNote(false);
  }

  const updatePrevNextButtonProps: UpdatePrevNextButtonsProps = {changed, initiateUpdate: initiateSubmit, initiateJumpElement};

  return (
    <div>
      <div className="p-4 text-center rounded-t border border-slate-300 shadow-md">
        <NodeDisplay node={data.node} editorConfig={tlhXmlEditorConfig}/>
        <sup>&nbsp;</sup><sub>&nbsp;</sub>
      </div>

      <div className="p-2 rounded-b border border-slate-300">

        <div className="mt-4">
          <LanguageInput initialValue={data.lg} onBlur={updateLanguage}/>
        </div>

        <div className="mt-4">
          {data.node.attributes.editingQuestion
            ? <WordQuestion comment={data.node.attributes.editingQuestion} removeNote={removeNote}/>
            : (isAddNote
              ? <WordQuestionForm cancel={() => setIsAddNote(false)} onSubmit={addEditingQuestion}/>
              : <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={() => setIsAddNote(true)}>{t('addEditingQuestion')}</button>)}
        </div>

        {data.morphologies.length === 0
          ? <div className="p-4 mt-2 rounded bg-amber-400 text-center">{t('noMorphologicalAnalysesFound')}</div>
          : data.morphologies.map((m, index) => <MorphAnalysisOptionContainer
              key={m.number}
              updatePrevNextButtonsProps={updatePrevNextButtonProps}
              morphologicalAnalysis={m}
              toggleAnalysisSelection={(letterIndex) => toggleAnalysisSelection(index, letterIndex)}
              toggleEncliticsSelection={(letterIndex) => toggleEncliticsSelection(index, letterIndex)}
              updateMorphology={(newMa) => updateMorphology(index, newMa)}
              setKeyHandlingEnabled={setKeyHandlingEnabled}
            />
          )}

        {isAddMorphologyState &&
          <MorphAnalysisOptionEditor
            morphologicalAnalysis={nextMorphAnalysis()}
            onSubmit={(newMa) => updateMorphology(data.morphologies.length, newMa)}
            cancelUpdate={toggleAddMorphology}/>}
      </div>

      <div className="grid grid-cols-3 my-2">
        <button type="button" className="p-2 rounded-l border-l border-y border-slate-500" onClick={toggleAddMorphology}>+&nbsp;{t('addMorphology')}</button>
        <button type="button" className="p-2 bg-red-600 text-white" onClick={deleteNode}>{t('deleteNode')}</button>
        <button type="button" className="p-2 rounded-r border-r border-y border-slate-500" onClick={enableEditWordState}>&#9998;&nbsp;{t('editContent')}</button>
      </div>

      <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => jumpEditableNodes('w', forward)}/>
    </div>
  );
}
