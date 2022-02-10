import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {useEffect, useState} from 'react';
import {MorphologicalAnalysis} from '../model/morphologicalAnalysis';
import {MorphAnalysisOptionContainer} from './morphAnalysisOption/MorphAnalysisOptionContainer';
import {NodeDisplay} from './NodeDisplay';
import {tlhXmlEditorConfig} from './editorConfig/tlhXmlEditorConfig';
import {useSelector} from 'react-redux';
import {allManuscriptLanguagesSelector, editorKeyConfigSelector} from '../store/store';
import {XmlElementNode} from './xmlModel/xmlModel';
import {MorphAnalysisOptionEditor} from './morphAnalysisOption/MorphAnalysisOptionEditor';
import {reconstructTransliteration} from './transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import update, {Spec} from 'immutability-helper';
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from './morphAnalysisOption/UpdatePrevNextButtons';
import {IoAddOutline, IoSettingsOutline} from 'react-icons/io5';
import {readWordNodeData, WordNodeData} from './editorConfig/wordNodeData';
import {WordQuestion} from './wordEditor/WordQuestion';
import {WordQuestionForm} from './wordEditor/WordQuestionForm';

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
  const allManuscriptLanguages = useSelector(allManuscriptLanguagesSelector);

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

  function addNote(value: string): void {
    updateNode((state) => update(state, {node: {attributes: {q: {$set: value}}}}));
    setIsAddNote(false);
  }

  const updatePrevNextButtonProps: UpdatePrevNextButtonsProps = {changed, initiateUpdate: initiateSubmit, initiateJumpElement};

  return (
    <>
      <div className="box has-text-centered">
        <NodeDisplay node={data.node} editorConfig={tlhXmlEditorConfig}/>
        <sup>&nbsp;</sup><sub>&nbsp;</sub>
      </div>

      <div className="box scrollable">

        <div className="field">
          <div className="control">
            <input defaultValue={data.lg} className="input" placeholder={t('language')} list="languages"
                   onBlur={(event) => updateLanguage(event.target.value)}/>
          </div>

          <datalist id="languages">
            {allManuscriptLanguages.map(({abbreviation}) => <option key={abbreviation}>{abbreviation}</option>)}
          </datalist>
        </div>

        {data.node.attributes.q
          ? <WordQuestion comment={data.node.attributes.q} removeNote={removeNote}/>
          : (isAddNote
            ? <WordQuestionForm onSubmit={addNote}/>
            : <div className="field">
              <button type="button" className="button is-primary is-fullwidth" onClick={() => setIsAddNote(true)}>{t('addNote')}</button>
            </div>)}

        {data.morphologies.length === 0
          ? <div className="notification is-warning has-text-centered">{t('noMorphologicalAnalysesFound')}</div>
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

      <div className="columns mt-2">
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={toggleAddMorphology}><IoAddOutline/>&nbsp;{t('addMorphology')}</button>
        </div>
        <div className="column">
          <button onClick={deleteNode} className="button is-danger is-fullwidth">{t('deleteNode')}</button>
        </div>
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={enableEditWordState}><IoSettingsOutline/>&nbsp;{t('editContent')}</button>
        </div>
      </div>

      <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => jumpEditableNodes('w', forward)}/>
    </>
  );
}
