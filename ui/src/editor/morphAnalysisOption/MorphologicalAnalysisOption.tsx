import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import React, {useEffect, useState} from 'react';
import {SelectedAnalysisOption} from '../selectedAnalysisOption';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisEditor} from './MorphAnalysisEditor';

export interface MorphAnalysisOptionIProps {
  ma: MorphologicalAnalysis;
  selectedOption: SelectedAnalysisOption[];
  updateSelected: (s: SelectedAnalysisOption, ctrl: boolean) => void;
  selectAll: (numerus?: Numerus) => void;
}

interface IProps extends MorphAnalysisOptionIProps {
  setKeyHandlingEnabled: (b: boolean) => void;
  updateMorphology: (newMa: MorphologicalAnalysis) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption({ma, selectedOption, updateSelected, selectAll, updateMorphology, setKeyHandlingEnabled}: IProps): JSX.Element {

  const [update, setIsUpdate] = useState(false);

  function toggleUpdate(): void {
    setKeyHandlingEnabled(update);
    setIsUpdate(!update);
  }

  useEffect(() => {
    // Enable key handling again after unmounting this component!
    return () => update ? setKeyHandlingEnabled(true) : void 0;
  });

  function innerUpdateMorphology(newMa: MorphologicalAnalysis): void {
    toggleUpdate();
    updateMorphology(newMa);
  }

  return (
    <div className="my-3">
      {update
        ? <MorphAnalysisEditor ma={ma} update={innerUpdateMorphology} toggleUpdate={toggleUpdate}/>
        : <MorphAnalysisOptionButtons ma={ma} selectedOption={selectedOption} updateSelected={updateSelected} selectAll={selectAll}
                                      toggleUpdate={toggleUpdate}/>}
    </div>
  );
}
