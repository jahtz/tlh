import {multiMorphAnalysisIsWithoutEnclitics, multiMorphAnalysisIsWithSingleEnclitics, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {EncliticsAnalysisDisplay} from './SingleMorphAnalysisOptionButton';
import {MultiMorphAnalysisSelection} from './MultiMorphAnalysisSelection';
import {SelectableButton} from '../../SelectableButton';
import {MultiMorphMultiSelectionButton} from './MultiMorphMultiSelectionButton';


const otherClasses = ['p-2', 'rounded', 'w-full'];

interface IProps {
  morphAnalysis: MultiMorphologicalAnalysis;
  toggleAnalysisSelection: (letterIndex: number, encLetterIndex: number | undefined) => void;
}

export function MultiMorphAnalysisOptionButtons({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {

  if (multiMorphAnalysisIsWithoutEnclitics(morphAnalysis)) {
    return (
      <div>
        <MultiMorphAnalysisSelection ma={morphAnalysis}/>

        {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) => <div key={index} className="mb-1">
          <SelectableButton selected={selected} className={otherClasses} onClick={() => toggleAnalysisSelection(index, undefined)}>
            <>{letter} - {analysis}</>
          </SelectableButton>
        </div>)}
      </div>
    );
  }

  if (multiMorphAnalysisIsWithSingleEnclitics(morphAnalysis)) {

    const {enclitics, analysis: encAnalysis} = morphAnalysis.encliticsAnalysis;

    return (
      <div>
        <MultiMorphAnalysisSelection ma={morphAnalysis}/>

        {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) => <div key={index} className="mb-1">
          <SelectableButton selected={selected} className={otherClasses} onClick={() => toggleAnalysisSelection(index, undefined)}>
            <>{letter} - {analysis} <EncliticsAnalysisDisplay enclitics={enclitics} analysis={encAnalysis}/></>
          </SelectableButton>
        </div>)}
      </div>
    );
  }

  const {enclitics, analysisOptions} = morphAnalysis.encliticsAnalysis;

  return (
    <div>
      {/* TODO: <MultiMorphAnalysisSelection ma={morphAnalysis}/>*/}

      {morphAnalysis.analysisOptions.map((morphAnalysisOption, index) =>
        <MultiMorphMultiSelectionButton key={index} ma={morphAnalysis} morphAnalysisOption={morphAnalysisOption} enclitics={enclitics}
                                        encliticsAnalysisOptions={analysisOptions}
                                        toggleAnalysisSelection={(letterIndex) => toggleAnalysisSelection(index, letterIndex)}/>
      )}
    </div>
  );
}
