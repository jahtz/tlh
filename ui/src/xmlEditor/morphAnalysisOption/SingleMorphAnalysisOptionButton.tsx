import {singleMorphAnalysisIsWithoutEnclitics, singleMorphAnalysisIsWithSingleEnclitics, SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {SelectableButton} from '../../genericElements/Buttons';

interface IProps {
  morphAnalysis: SingleMorphologicalAnalysis;
  toggleAnalysisSelection: (encLetterIndex: number | undefined) => void;
}

export function EncliticsAnalysisDisplay({enclitics, analysis}: { enclitics: string, analysis: string }): JSX.Element {
  return (
    <>&nbsp;+=&nbsp; {enclitics} @ {analysis}</>
  );
}

const otherClasses = ['p-2', 'rounded', 'w-full'];

export function SingleMorphAnalysisOptionButton({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {

  if (singleMorphAnalysisIsWithoutEnclitics(morphAnalysis)) {
    return (
      <SelectableButton selected={morphAnalysis.selected} otherClasses={otherClasses} onClick={() => toggleAnalysisSelection(undefined)}>
        <>{morphAnalysis.analysis || morphAnalysis.paradigmClass}</>
      </SelectableButton>
    );
  }

  if (singleMorphAnalysisIsWithSingleEnclitics(morphAnalysis)) {
    const encliticsAnalysis = morphAnalysis.encliticsAnalysis;

    return (
      <SelectableButton selected={morphAnalysis.selected} otherClasses={otherClasses} onClick={() => toggleAnalysisSelection(undefined)}>
        <>{morphAnalysis.analysis} <EncliticsAnalysisDisplay enclitics={encliticsAnalysis.enclitics} analysis={encliticsAnalysis.analysis}/></>
      </SelectableButton>
    );
  }

  const {analysisOptions, enclitics} = morphAnalysis.encliticsAnalysis;

  return (
    <>
      {analysisOptions.map(({letter, analysis, selected}, index) =>
        <SelectableButton key={letter} selected={selected} otherClasses={['mb-1', ...otherClasses]} onClick={() => toggleAnalysisSelection(index)}>
          <>{letter} - {analysis} <EncliticsAnalysisDisplay enclitics={enclitics} analysis={analysis}/></>
        </SelectableButton>
      )}
    </>
  );
}