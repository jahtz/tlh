import {XmlEditableNodeIProps} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {JSX, useState} from 'react';
import {MorphologicalAnalysis, multiMorphAnalysisWithoutEnclitics, readMorphologiesFromNode, writeMorphAnalysisValue} from '../../model/morphologicalAnalysis';
import {MorphAnalysisOptionContainer} from '../morphAnalysisOption/MorphAnalysisOptionContainer';
import {findFirstXmlElementByTagName, isXmlElementNode, lastChildNode, xmlElementNode, XmlElementNode} from 'simple_xml';
import {MorphAnalysisOptionEditor} from '../morphAnalysisOption/MorphAnalysisOptionEditor';
import {WordContentEditor} from './wordContentEditor/WordContentEditor';
import {LanguageInput} from '../LanguageInput';
import {readSelectedMorphology, SelectedMorphAnalysis} from '../../model/selectedMorphologicalAnalysis';
import {WordStringChildEditor} from './WordStringChildEditor';
import {getPriorSibling, getPriorSiblingPath} from '../../nodeIterators';
import {AOption} from '../../myOption';

type States = 'DefaultState' | 'AddMorphology' | 'EditEditingQuestion' | 'EditFootNoteState' | 'EditContent';

export function WordNodeEditor({node, path, updateEditedNode, setKeyHandlingEnabled, rootNode, updateOtherNode}: XmlEditableNodeIProps<'w'>): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<States>('DefaultState');

  const textLanguage = AOption.of(findFirstXmlElementByTagName(rootNode, 'text'))
    .map((textElement) => textElement.attributes['xml:lang'])
    .get();

  const lineBreakLanguage = AOption.of(getPriorSibling(rootNode, path, 'lb'))
    .map((lineBreakElement) => lineBreakElement.attributes.lg)
    .get();

  const selectedMorphologies: SelectedMorphAnalysis[] = node.attributes.mrp0sel !== undefined
    ? readSelectedMorphology(node.attributes.mrp0sel)
    : [];

  const morphologies: MorphologicalAnalysis[] = readMorphologiesFromNode(node, selectedMorphologies);

  function toggleMorphology(currentMrp0sel: string, morphNumber: number, letter: string | undefined, encLetter: string | undefined, targetState: boolean | undefined): string {

    const value = morphNumber + (letter !== undefined ? letter : '') + (encLetter !== undefined ? encLetter : '');

    // Check if selected
    const selected = currentMrp0sel.includes(value);

    if (targetState !== undefined && targetState === selected) {
      // Nothing to do...
      return currentMrp0sel;
    } else {
      // targetState === undefined || (targetState !== undefined && targetState !== selected)
      return selected
        ? currentMrp0sel.replace(value, '').replaceAll(/\s+/g, ' ')
        : currentMrp0sel + ' ' + value;
    }
  }

  const toggleAnalysisSelection = (morphNumber: number, letter: string | undefined, encLetter: string | undefined, targetState: boolean | undefined): void => updateEditedNode({
    attributes: {mrp0sel: (value) => toggleMorphology(value || '', morphNumber, letter, encLetter, targetState)}
  });

  function enableEditWordState(): void {
    setKeyHandlingEnabled(false);
    setState('EditContent');
  }

  function handleEditUpdate(node: XmlElementNode<'w'>): void {
    const maybeLineBreakPath = getPriorSiblingPath(rootNode, path, 'lb');

    if (maybeLineBreakPath !== undefined) {
      updateOtherNode(maybeLineBreakPath, {attributes: {cuDirty: {$set: '1'}}});
    }

    updateEditedNode({$set: node});
    cancelEdit();
  }

  function cancelEdit(): void {
    setKeyHandlingEnabled(true);
    setState('DefaultState');
  }

  function updateMorphology(number: number, newMa: MorphologicalAnalysis): void {
    updateEditedNode({attributes: {[`mrp${number}`]: {$set: writeMorphAnalysisValue(newMa)}}});
    setState('DefaultState');
  }

  function toggleAddMorphology(): void {
    setKeyHandlingEnabled(state === 'AddMorphology');
    setState(state === 'AddMorphology' ? 'DefaultState' : 'AddMorphology');
  }

  const nextMorphAnalysis = (): MorphologicalAnalysis => multiMorphAnalysisWithoutEnclitics(Math.max(0, ...morphologies.map(({number}) => number)) + 1);

  const updateAttribute = (name: string, value: string | undefined): void => updateEditedNode({attributes: {[name]: {$set: value}}});

  // editing question

  const setEditingQuestion = (value: string | undefined) => updateAttribute('editingQuestion', value);

  const onEditingQuestionSubmit = (value: string): void => {
    setEditingQuestion(value);
    setState('DefaultState');
  };

  const onEditEditingQuestionButtonClick = (): void => setState((oldState) => oldState === 'EditEditingQuestion' ? 'DefaultState' : 'EditEditingQuestion');

  const onRemoveEditingQuestion = (): void => {
    setEditingQuestion(undefined);
    setState('DefaultState');
  };

  // footnote

  const lastChild = lastChildNode(node);

  const footNote = lastChild !== undefined && isXmlElementNode(lastChild) && lastChild.tagName === 'note'
    ? lastChild.attributes.c
    : undefined;

  const onEditFootNoteButtonClick = (): void => setState((oldState) => oldState === 'EditFootNoteState' ? 'DefaultState' : 'EditFootNoteState');

  const addOrUpdateFootNote = (value: string): void => updateEditedNode(
    footNote === undefined
      ? {children: {$push: [xmlElementNode('note', {c: value})]}}
      : {children: {[node.children.length - 1]: {attributes: {c: {$set: value}}}}});

  const onFootNoteSubmit = (value: string): void => {
    addOrUpdateFootNote(value);
    setState('DefaultState');
  };

  const onRemoveFootNote = (): void => {
    if (footNote !== undefined) {
      updateEditedNode({children: {$splice: [[node.children.length - 1, 1]]}});
    }
    setState('DefaultState');
  };

  // Html

  const onFocus = () => setKeyHandlingEnabled(false);
  const onBlur = () => setKeyHandlingEnabled(true);
  const onCancel = () => setState('DefaultState');

  if (state === 'EditContent') {
    const language = node.attributes.lg || lineBreakLanguage || textLanguage || 'Hit';

    return <WordContentEditor oldNode={node} language={language} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>;
  }

  return (
    <>
      <div className="mt-2">
        <LanguageInput initialValue={node.attributes.lg} parentLanguages={{text: textLanguage, lb: lineBreakLanguage}}
                       onChange={(lg) => updateAttribute('lg', lg.trim() || '')} onFocus={onFocus} onBlur={onBlur}/>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={enableEditWordState}>
          &#9998; {t('editContent')}
        </button>
        <button type="button" onClick={onEditEditingQuestionButtonClick} className="p-2 rounded bg-teal-400 text-white w-full">
          &#10068; {t('editEditingQuestion')}
        </button>
        <button type="button" onClick={onEditFootNoteButtonClick} className="p-2 rounded bg-slate-400 text-white w-full">
          {t('editFootNote')}
        </button>
      </div>

      {state === 'EditEditingQuestion' &&
        <WordStringChildEditor title={t('editingQuestion')} initialValue={node.attributes.editingQuestion} onDelete={onRemoveEditingQuestion}
                               onCancel={onCancel} onSubmit={onEditingQuestionSubmit} onFocus={onFocus} onBlur={onBlur}/>}

      {state === 'EditFootNoteState' &&
        <WordStringChildEditor title={t('footNote')} initialValue={footNote} onDelete={onRemoveFootNote} onCancel={onCancel} onSubmit={onFootNoteSubmit}
                               onFocus={onFocus} onBlur={onBlur}/>}

      {node.attributes.editingQuestion && <div className="my-2 p-2 rounded bg-teal-400 text-white text-center">
        {t('editingQuestion')}: <span className="font-bold">{node.attributes.editingQuestion}</span>!
      </div>}

      {footNote && <div className="my-2 p-2 rounded bg-slate-400 text-white text-center">
        {t('footNote')}: <span className="font-bold">{footNote}</span>
      </div>}

      <hr className="my-2"/>

      <section>
        <h2 className="mb-2 font-bold text-center">
          {t('morphologicalAnalysis_plural')}
          {node.attributes.mrp0sel !== undefined && <span>(mrp0sel=&quot;{node.attributes.mrp0sel}&quot;)</span>}
        </h2>

        {morphologies.length === 0
          ? (
            <div>
              <div className="p-2 rounded bg-amber-400 text-center">{t('noMorphologicalAnalysesFound')}</div>

              {node.attributes.mrp0sel === 'DEL'
                ? <div className="mt-2 p-2 rounded bg-blue-600 text-white text-center w-full">mrp0sel=&quot;DEL&quot;</div>
                : (
                  <button type="button" className="mt-2 p-2 rounded border border-slate-500 text-center w-full"
                          onClick={() => updateAttribute('mrp0sel', 'DEL')}>
                    {t('set_mrp0sel=DEL')}
                  </button>
                )}
            </div>
          )
          : morphologies.map((m) =>
            <div className="mt-2" key={m.number}>
              <MorphAnalysisOptionContainer
                morphologicalAnalysis={m}
                toggleAnalysisSelection={(letter, encLetter, targetState) => toggleAnalysisSelection(m.number, letter, encLetter, targetState)}
                updateMorphology={(newMa) => updateMorphology(m.number, newMa)}
                setKeyHandlingEnabled={setKeyHandlingEnabled}
              />
            </div>
          )}

        {state === 'AddMorphology'
          ? <MorphAnalysisOptionEditor initialMorphologicalAnalysis={nextMorphAnalysis()}
                                       onSubmit={(newMa) => updateMorphology(morphologies.length, newMa)}
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
