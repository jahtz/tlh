import classNames from 'classnames';
import {multiMorphAnalysisIsWithMultiEnclitics, multiMorphAnalysisIsWithSingleEnclitics, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {EncliticsAnalysisDisplay} from './SingleMorphAnalysisOptionButton';
import {MultiMorphAnalysisSelection} from './MultiMorphAnalysisSelection';

interface IProps {
  morphAnalysis: MultiMorphologicalAnalysis;
  toggleAnalysisSelection: (index: number) => void;
}

export function MultiMorphAnalysisOptionButtons({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {

  if (multiMorphAnalysisIsWithMultiEnclitics(morphAnalysis)) {

    return (
      <div>
        <MultiMorphAnalysisSelection ma={morphAnalysis}/>

        {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) =>
          <div key={index} className="mb-1">
            <button type="button" className={classNames('p-2', 'rounded', 'w-full', selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}
                    onClick={() => toggleAnalysisSelection(index)}>
              {letter} - {analysis}
            </button>

            {selected && <div className="my-1 flex">
              {morphAnalysis.encliticsAnalysis.analysisOptions.map(({analysis: encAnalysis, letter: encLetter, selected: encSelected}) =>

                <button key={encLetter} type="button" onClick={() => void 0}
                        className={classNames('p-2', 'rounded', 'w-full', encSelected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}>
                  {encLetter} - {morphAnalysis.encliticsAnalysis.enclitics} @ {encAnalysis}
                </button>
              )}
            </div>}

            {/*<LetteredAnalysisOptionButtons analysisOptions={encliticsAnalysis.analysisOptions} toggleAnalysisSelection={() => void 0}/>*/}
          </div>
        )}
      </div>
    );
  } else if (multiMorphAnalysisIsWithSingleEnclitics(morphAnalysis)) {

    const encliticsAnalysis = morphAnalysis.encliticsAnalysis;

    return (
      <div>
        <MultiMorphAnalysisSelection ma={morphAnalysis}/>

        {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) =>
          <div key={index} className="mb-1">
            <button type="button" className={classNames('p-2', 'rounded', 'w-full', selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}
                    onClick={() => toggleAnalysisSelection(index)}>
              {letter} - {analysis}
              {encliticsAnalysis && <>
                &nbsp;+=&nbsp; <EncliticsAnalysisDisplay enclitics={encliticsAnalysis.enclitics} analysis={encliticsAnalysis.analysis}/>
              </>}
            </button>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <MultiMorphAnalysisSelection ma={morphAnalysis}/>

        {morphAnalysis.analysisOptions.map(({letter, analysis, selected}, index) =>
          <div key={index} className="mb-1">
            <button type="button" className={classNames('p-2', 'rounded', 'w-full', selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}
                    onClick={() => toggleAnalysisSelection(index)}>
              {letter} - {analysis}
            </button>
          </div>
        )}
      </div>
    );
  }
}
