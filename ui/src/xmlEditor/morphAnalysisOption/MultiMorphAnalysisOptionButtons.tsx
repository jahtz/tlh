import {MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {EncliticsAnalysisDisplay} from './SingleMorphAnalysisOptionButton';
import {MultiMorphAnalysisSelection} from './MultiMorphAnalysisSelection';
import {MultiMorphMultiEncAnalysisSelection} from './MultiMorphMultiEncAnalysisSelection';
import {SelectableButton} from '../../genericElements/Buttons';
import {MultiMorphMultiSelectionButton} from './MultiMorphMultiSelectionButton';


const otherClasses = ['p-2', 'rounded', 'w-full'];

interface IProps {
  morphAnalysis: MultiMorphologicalAnalysis;
  toggleAnalysisSelection: (letter: string, encLetter: string | undefined) => void;
}

export function MultiMorphAnalysisOptionButtons({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {
  switch (morphAnalysis._type) {
    case 'MultiMorphAnalysisWithoutEnclitics':
      return (
        <div>
          <MultiMorphAnalysisSelection ma={morphAnalysis}/>

          {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) => <div key={index} className="mb-1">
            <SelectableButton selected={selected} otherClasses={otherClasses} onClick={() => toggleAnalysisSelection(letter, undefined)}>
              <>{letter} - {analysis}</>
            </SelectableButton>
          </div>)}
        </div>
      );

    case 'MultiMorphAnalysisWithSingleEnclitics':
      return (
        <div>
          <MultiMorphAnalysisSelection ma={morphAnalysis}/>

          {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) => <div key={index} className="mb-1">
            <SelectableButton selected={selected} otherClasses={otherClasses} onClick={() => toggleAnalysisSelection(letter, undefined)}>
              <>{letter} - {analysis} <EncliticsAnalysisDisplay enclitics={morphAnalysis.encliticsAnalysis.enclitics}
                                                                analysis={morphAnalysis.encliticsAnalysis.analysis}/></>
            </SelectableButton>
          </div>)}
        </div>
      );

    case 'MultiMorphAnalysisWithMultiEnclitics':
      return (
        <div>
          <MultiMorphMultiEncAnalysisSelection ma={morphAnalysis}/>

          {morphAnalysis.analysisOptions.map((morphAnalysisOption, index) =>
            <MultiMorphMultiSelectionButton key={index} ma={morphAnalysis} morphAnalysisOption={morphAnalysisOption}
                                            enclitics={morphAnalysis.encliticsAnalysis.enclitics}
                                            encliticsAnalysisOptions={morphAnalysis.encliticsAnalysis.analysisOptions}
                                            toggleAnalysisSelection={(letterIndex) => toggleAnalysisSelection(morphAnalysisOption.letter, letterIndex)}/>
          )}
        </div>
      );
  }
}
