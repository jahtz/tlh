import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {useEffect, useState} from 'react';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisOptionEditor} from './MorphAnalysisOptionEditor';
import {UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';

interface IProps {
  updatePrevNextButtonsProps: UpdatePrevNextButtonsProps;

  morphologicalAnalysis: MorphologicalAnalysis;
  updateMorphology: (ma: MorphologicalAnalysis) => void;
  toggleAnalysisSelection: (index?: number) => void;
  toggleEncliticsSelection: (index: number) => void;

  setKeyHandlingEnabled: (b: boolean) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOptionContainer({
  updatePrevNextButtonsProps,
  morphologicalAnalysis,
  updateMorphology,
  toggleAnalysisSelection,
  toggleEncliticsSelection,
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

  if (isUpdateMode) {
    return <MorphAnalysisOptionEditor
      morphologicalAnalysis={morphologicalAnalysis}
      onSubmit={onEditSubmit}
      cancelUpdate={disableUpdateMode}/>;
  } else {
    return (
      <MorphAnalysisOptionButtons
        updatePrevNextButtonsProps={updatePrevNextButtonsProps}
        morphologicalAnalysis={morphologicalAnalysis}
        toggleAnalysisSelection={toggleAnalysisSelection}
        toggleEncliticsSelection={toggleEncliticsSelection}
        enableEditMode={enableUpdateMode}/>
    );
  }
}
