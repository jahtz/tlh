import {Field} from 'formik';
import {JSX} from 'react';
import {allKnownProvenances} from '../provenances';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';

export function ProvenanceField(): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="mt-2">
      <label htmlFor="provenance" className="font-bold">{t('provenance')}:</label>

      <Field name="provenance" id="provenance" placeholder={t('provenance')} list="provenances"
             className={classNames('mt-2', 'p-2', 'rounded', 'border', 'border-slate-500', 'w-full')}/>

      <datalist id="provenances">
        {allKnownProvenances.map(({englishName}) => <option key={englishName} value={englishName}/>)}
      </datalist>
    </div>
  );
}