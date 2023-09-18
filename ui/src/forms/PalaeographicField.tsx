import classNames from 'classnames';
import {ErrorMessage, Field} from 'formik';
import {getNameForPalaeoClassification} from '../model/manuscriptProperties/palaeoClassification';
import {useTranslation} from 'react-i18next';
import {PalaeographicClassification} from '../graphql';
import {JSX} from 'react';
import {explTextClasses} from '../defaultDesign';

interface IProps {
  palaeoClassSure: boolean;
  setPalaeoClassSure: (value: boolean) => void;
}

export const palaeographicClassifications: PalaeographicClassification[] = [
  PalaeographicClassification.AssyroMittanianScript,
  PalaeographicClassification.LateNewScript,
  PalaeographicClassification.MiddleAssyrianScript,
  PalaeographicClassification.MiddleBabylonianScript,
  PalaeographicClassification.MiddleScript,
  PalaeographicClassification.NewScript,
  PalaeographicClassification.OldAssyrianScript,
  PalaeographicClassification.OldScript,
  PalaeographicClassification.Unclassified,
];

export function PalaeoClassField({palaeoClassSure, setPalaeoClassSure}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const classes = classNames('flex-grow', 'p-2', 'rounded-l', 'border', 'border-slate-500', 'bg-white');

  return (
    <div className="mt-2">
      <label className="font-bold">{t('palaeographicClassification')}:</label>

      <div className="mt-2 flex">
        <Field as="select" id="palaeographicClassification" name="palaeographicClassification" className={classes}>
          {palaeographicClassifications.map((pc) =>
            <option key={pc} value={pc}>{getNameForPalaeoClassification(pc, t)}</option>
          )}
        </Field>

        <button type="button" onClick={() => setPalaeoClassSure(true)}
                className={classNames('p-2', palaeoClassSure ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}>
          {t('sure')}
        </button>

        <button type="button" onClick={() => setPalaeoClassSure(false)}
                className={classNames('p-2', 'rounded-r', palaeoClassSure ? ['border', 'border-slate-500'] : ['bg-blue-600', 'text-white'])}>
          {t('notSure')}
        </button>
      </div>

      <ErrorMessage name="palaeographicClassification">{msg => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
      <ErrorMessage name="palaeographicClassificationSure">{msg => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
    </div>
  );

}