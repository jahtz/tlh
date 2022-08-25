import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {useEffect, useState} from 'react';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisOptionEditor} from './MorphAnalysisOptionEditor';

export interface CanToggleAnalysisSelection {
  toggleAnalysisSelection: (letterIndex: number | undefined, encLetterIndex: number | undefined, targetState: boolean | undefined) => void;
}

interface IProps extends CanToggleAnalysisSelection {
  morphologicalAnalysis: MorphologicalAnalysis;
  updateMorphology: (ma: MorphologicalAnalysis) => void;
  setKeyHandlingEnabled: (b: boolean) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOptionContainer({
  morphologicalAnalysis,
  updateMorphology,
  toggleAnalysisSelection,
  setKeyHandlingEnabled,
}: IProps): JSX.Element {

  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    // Enable key handling again after unmounting this component!
    return () => {
      isUpdateMode && setKeyHandlingEnabled(true);
    };
  });

  function disableUpdateMode(): void {
    setKeyHandlingEnabled(true);
    setIsUpdateMode(false);
  }

  function enableUpdateMode(): void {
    setKeyHandlingEnabled(false);
    setIsUpdateMode(true);
  }

  function onEditSubmit(ma: MorphologicalAnalysis): void {
    disableUpdateMode();
    updateMorphology(ma);
  }

  return isUpdateMode
    ? <MorphAnalysisOptionEditor morphologicalAnalysis={morphologicalAnalysis} onSubmit={onEditSubmit} cancelUpdate={disableUpdateMode}/>
    : <MorphAnalysisOptionButtons morphologicalAnalysis={morphologicalAnalysis} toggleAnalysisSelection={toggleAnalysisSelection}
                                  enableEditMode={enableUpdateMode}/>;
}
