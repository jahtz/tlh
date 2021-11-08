import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IoChevronDown, IoChevronForward, IoSettingsOutline} from 'react-icons/io5';
import {MultiMorphAnalysisSelection} from './MultiMorphAnalysisSelection';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';
import {Numerus} from './MorphologicalAnalysisOption';
import {LetteredAnalysisOptionButtons} from './LetteredAnalysisOptionButtons';


interface IProps extends UpdatePrevNextButtonsProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string) => void;
  toggleEncliticsSelection: (letter: string) => void;
  toggleEdit: () => void;
}


export function analysisIsInNumerus(analysis: string, numerus: Numerus): boolean {
  return analysis.includes(numerus) || analysis.includes('ABL') || analysis.includes('INS') || analysis.includes('ALL');
}


const buttonClasses = 'button is-outlined is-primary is-fullwidth';

export function MorphAnalysisOptionButtons({
  changed,
  morphologicalAnalysis,
  toggleAnalysisSelection,
  toggleEncliticsSelection,
  initiateUpdate,
  initiateJumpElement,
  toggleEdit
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [isReduced, setIsReduced] = useState(false);

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;
  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  function selectAll(ma: MultiMorphologicalAnalysis, numerus?: Numerus): void {
    ma.analysisOptions
      .filter(({analysis}) => !numerus || analysisIsInNumerus(analysis, numerus))
      .map(({letter}) => letter)
      .forEach((letter) => toggleAnalysisSelection(letter));
  }

  return (
    <>
      <div className="my-2">
        <div className="field has-addons">
          <div className="control">
            <button onClick={() => setIsReduced((value) => !value)} className="button">
              {isReduced ? <IoChevronForward/> : <IoChevronDown/>}
            </button>
          </div>
          <div className="control is-expanded">
            <button className="button is-static is-fullwidth">
              &nbsp;
              {number})&nbsp;<span className="has-text-danger">{translation}</span>&nbsp;({referenceWord},
              {t('paradigmClass')}:&nbsp;<span className="has-text-danger">{paradigmClass}</span>
              {determinativ && <span>, {t('determinativ')}:&nbsp;<span className="has-text-danger">{determinativ}</span></span>})&nbsp;
            </button>
          </div>
          {!isSingleAnalysisOption && <div className="control">
            <button className="button" onClick={toggleEdit}><IoSettingsOutline/></button>
          </div>}
        </div>
      </div>

      {!isReduced && <>
        {!isSingleAnalysisOption && <MultiMorphAnalysisSelection ma={morphologicalAnalysis}/>}

        <div className="columns">
          <div className="column">
            {isSingleAnalysisOption
              ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis} toggleAnalysisSelection={() => toggleAnalysisSelection(undefined)}/>
              : <LetteredAnalysisOptionButtons analysisOptions={morphologicalAnalysis.analysisOptions} toggleAnalysisSelection={toggleAnalysisSelection}/>
            }

          </div>

          {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis && <div className="column">
            <LetteredAnalysisOptionButtons analysisOptions={encliticsAnalysis.analysisOptions} toggleAnalysisSelection={toggleEncliticsSelection}/>
          </div>}

          <div className="column is-one-third">
            <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>

            {!isSingleAnalysisOption && <>
              <div className="mb-1">
                <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis)} tabIndex={-1}>
                  {t('selectAll')}
                </button>
              </div>
              <div className="mb-1">
                <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis, Numerus.Singular)} tabIndex={-1}>
                  {t('selectAllSingular')}
                </button>
              </div>
              <div className="mb-1">
                <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis, Numerus.Plural)} tabIndex={-1}>
                  {t('selectAllPlural')}
                </button>
              </div>
            </>}
          </div>
        </div>

        {encliticsAnalysis && 'analysis' in encliticsAnalysis && <div className="box has-text-centered">
          <span>{t('encliticsAnalysis')}: <code>{encliticsAnalysis.enclitics}</code> @ <code>{encliticsAnalysis.analysis}</code></span>
        </div>}
      </>}
    </>
  );
}
