import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {WordComponent} from "../manuscript/TransliterationLineResult";
import {MorphAnalysisOption} from "./MorphologicalAnalysisOption";
import {EditedWord} from "./DocumentEditor";

interface WordEditorIProps {
  w: EditedWord;
  update: (morph: string, paragraphId: number, wordId: number) => void;
  previousWord: () => void;
  nextWord: () => void;
}

export function WordEditor({w: {word, paragraphIndex, wordIndex}, update, previousWord, nextWord}: WordEditorIProps): JSX.Element {

  const {t} = useTranslation('common');
  const [selectedMorphology, setSelectedMorphology] = useState<string | undefined>(word.mrp0sel);

  function resetMorphAnalysis(): void {
    setSelectedMorphology(word.mrp0sel);
  }

  function handleUpdate(): void {
    if (selectedMorphology) {
      update(selectedMorphology, paragraphIndex, wordIndex);
    }
  }

  return (
    <div>
      <div className="box has-text-centered">
        <WordComponent word={word}/>
      </div>

      {word.language && <p><b>{t('language')}:</b> {word.language}</p>}

      {/* <p>
        <b>{t('currentSelectedMorphology')}:</b>
        {selectedMorphology || t('noSelection')}
      </p>
      */}

      {word.morphologies && word.morphologies.map((m, index) =>
        <MorphAnalysisOption key={index} ma={m} selectedOption={selectedMorphology} updateSelected={setSelectedMorphology}/>
      )}

      {selectedMorphology && selectedMorphology !== word.mrp0sel && <>
        <hr/>

        <div className="box has-text-centered">{t('selected')}: {selectedMorphology} {/*TODO: show selected morphology!*/}</div>

        <div className="level">
          <div className="level-item">
            <button onClick={resetMorphAnalysis} className="button is-warning is-fullwidth">{t('resetMorphAnalysis')}</button>
          </div>
          <div className="level-item">
            <button onClick={handleUpdate} className="button is-link is-fullwidth">{t('updateMorphAnalysis')}</button>
          </div>
        </div>

      </>}

      <div className="box level">
        <div className="level-item">
          <button onClick={previousWord} className="button is-fullwidth">{t('previousWord')}</button>
        </div>
        <div className="level-item">
          <button onClick={nextWord} className="button is-fullwidth">{t('nextWord')}</button>
        </div>
      </div>
    </div>
  );
}
