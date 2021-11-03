import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import React, {useEffect, useState} from 'react';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisEditor} from './MorphAnalysisEditor';
import {UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';

interface IProps extends UpdatePrevNextButtonsProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string) => void;
  toggleEncliticsSelection: (letter: string) => void;

  setKeyHandlingEnabled: (b: boolean) => void;
  updateMorphology: (newMa: MorphologicalAnalysis) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption({
  changed,
  morphologicalAnalysis,
  updateMorphology,
  setKeyHandlingEnabled,
  toggleAnalysisSelection,
  toggleEncliticsSelection,
  initiateUpdate,
  initiateJumpElement
}: IProps): JSX.Element {

  const [update, setIsUpdate] = useState(false);

  function toggleUpdateMode(): void {
    setKeyHandlingEnabled(update);
    setIsUpdate(!update);
  }

  useEffect(() => {
    // Enable key handling again after unmounting this component!
    return () => update ? setKeyHandlingEnabled(true) : void 0;
  });

  function innerUpdateMorphology(newMa: MorphologicalAnalysis): void {
    toggleUpdateMode();
    updateMorphology(newMa);
  }

  return update
    ? <MorphAnalysisEditor ma={morphologicalAnalysis} update={innerUpdateMorphology} toggleUpdate={toggleUpdateMode}/>
    : <MorphAnalysisOptionButtons
      changed={changed}
      morphologicalAnalysis={morphologicalAnalysis}
      toggleAnalysisSelection={toggleAnalysisSelection}
      toggleEncliticsSelection={toggleEncliticsSelection}
      initiateUpdate={initiateUpdate}
      initiateJumpElement={initiateJumpElement}/>;
}
