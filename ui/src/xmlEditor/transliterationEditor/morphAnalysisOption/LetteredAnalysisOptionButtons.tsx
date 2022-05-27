import classNames from 'classnames';
import {LetteredAnalysisOption} from '../../../model/analysisOptions';

interface IProps {
  analysisOptions: LetteredAnalysisOption[];
  toggleAnalysisSelection: (index: number) => void;
}

export function LetteredAnalysisOptionButtons({analysisOptions, toggleAnalysisSelection}: IProps): JSX.Element {
  return (
    <div>
      {analysisOptions.map(({letter, analysis, selected}, index) =>
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
