import classNames from 'classnames';
import {ErrorMessage, Field} from 'formik';
import {allPalaeographicClassifications, getNameForPalaeoClassification} from '../palaeoClassification';
import {useTranslation} from 'react-i18next';

interface IProps {
  palaeographicClassificationSure: boolean;
  setPalaeographicClassificationSure: (value: boolean) => void;
}

export function PalaeographicClassificationField({palaeographicClassificationSure, setPalaeographicClassificationSure}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const classes = classNames(
    'flex-grow', 'p-2', 'rounded-l', 'border', 'border-slate-500', 'bg-white',
  );

  return (
    <div className="mt-2">
      <label className="font-bold">{t('palaeographicClassification')}:</label>

      <div className="mt-2 flex">
        <Field as="select" id="palaeographicClassification" name="palaeographicClassification" className={classes}>
          {allPalaeographicClassifications.map((pc) =>
            <option key={pc} value={pc}>{getNameForPalaeoClassification(pc, t)}</option>
          )}
        </Field>

        <button type="button" onClick={() => setPalaeographicClassificationSure(true)}
                className={classNames('p-2', palaeographicClassificationSure ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}>
          {t('sure')}
        </button>

        <button type="button" onClick={() => setPalaeographicClassificationSure(false)}
                className={classNames('p-2', 'rounded-r', palaeographicClassificationSure ? ['border', 'border-slate-500'] : ['bg-blue-600', 'text-white'])}>
          {t('notSure')}
        </button>
      </div>

      <ErrorMessage name="palaeographicClassification">{msg => <p className="help is-danger">{msg}</p>}</ErrorMessage>

      <ErrorMessage name="palaeographicClassificationSure">{msg => <p className="help is-danger">{msg}</p>}</ErrorMessage>
    </div>
  );

}