import classNames from 'classnames';
import {singleMorphAnalysisIsWithoutEnclitics, singleMorphAnalysisIsWithSingleEnclitics, SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';

interface IProps {
  morphAnalysis: SingleMorphologicalAnalysis;
  toggleAnalysisSelection: () => void;
}

export function EncliticsAnalysisDisplay({enclitics, analysis}: { enclitics: string, analysis: string }): JSX.Element {
  return (
    <>{enclitics} @ {analysis}</>
  );
}

const selectedClasses = ['bg-blue-500', 'text-white'];
const notSelectedClasses = ['border', 'border-slate-500'];

export function SingleMorphAnalysisOptionButton({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {

  if (singleMorphAnalysisIsWithoutEnclitics(morphAnalysis)) {
    return (
      <button className={classNames('p-2', 'rounded', 'w-full', morphAnalysis.selected ? selectedClasses : notSelectedClasses)}
              onClick={toggleAnalysisSelection}>{morphAnalysis.number} - {morphAnalysis.analysis}
      </button>
    );

  } else if (singleMorphAnalysisIsWithSingleEnclitics(morphAnalysis)) {

    const encliticsAnalysis = morphAnalysis.encliticsAnalysis;

    return (
      <button className={classNames('p-2', 'rounded', 'w-full', morphAnalysis.selected ? selectedClasses : notSelectedClasses)}
              onClick={toggleAnalysisSelection}>
        {morphAnalysis.number} - {morphAnalysis.analysis}
        {morphAnalysis.encliticsAnalysis && <>
          &nbsp;+=&nbsp; <EncliticsAnalysisDisplay enclitics={encliticsAnalysis.enclitics} analysis={encliticsAnalysis.analysis}/>
        </>}
      </button>
    );
  } else {

    const encliticsAnalysis = morphAnalysis.encliticsAnalysis;

    return (
      <>
        {encliticsAnalysis.analysisOptions.map((ea) =>
          <button key={ea.letter}
                  className={classNames('mb-1', 'p-2', 'rounded', 'w-full', ea.selected ? selectedClasses : notSelectedClasses)}
                  onClick={toggleAnalysisSelection}>
            {morphAnalysis.number} - {morphAnalysis.analysis}&nbsp;&nbsp;+=&nbsp;&nbsp;{ea.letter} - <EncliticsAnalysisDisplay
            enclitics={encliticsAnalysis.enclitics} analysis={ea.analysis}/>
          </button>)}
      </>
    );
  }
}