import {ErrorMessage, Field, FormikErrors, FormikTouched} from 'formik';
import {ManuscriptIdentifierInput, ManuscriptIdentifierType} from '../graphql';
import {useTranslation} from 'react-i18next';
import classnames from 'classnames';

interface ManuscriptIdentifierOption {
  type: ManuscriptIdentifierType;
  name: string;
}

interface IProps {
  mainId: string;
  deleteFunc?: () => void;
  errors: FormikErrors<ManuscriptIdentifierInput> | undefined;
  touched: FormikTouched<ManuscriptIdentifierInput> | undefined;
}


export function ManuscriptIdInputField({mainId, deleteFunc, errors, touched}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const identifierTypeClassName = classnames('p-2', 'rounded-l', 'border-l', 'border-y', 'bg-white',
    touched?.identifierType
      ? (errors?.identifierType ? 'border-red-500' : 'border-green-500')
      : 'border-slate-500'
  );

  const identifierClassName = classnames('flex-grow', 'p-2', {'rounded-r': !deleteFunc}, 'border',
    touched?.identifier
      ? (errors?.identifier ? 'border-red-500' : 'border-green-500')
      : 'border-slate-500');

  const values: ManuscriptIdentifierOption[] = [
    {type: ManuscriptIdentifierType.ExcavationNumber, name: t('Ausgrabungsnummer')},
    {type: ManuscriptIdentifierType.CollectionNumber, name: t('Sammlungsnummer')},
    ...(deleteFunc ? [{type: ManuscriptIdentifierType.PublicationShortReference, name: t('Publikationsnummer')}] : [])
  ];

  return (
    <>
      <div className="mt-2 flex">
        <Field as="select" className={identifierTypeClassName} name={`${mainId}.identifierType`} id={`${mainId}.identifierType`}>
          {values.map(({type, name}) => <option key={type} value={type}>{name}</option>)}
        </Field>

        <Field id={`${mainId}.identifier`} name={`${mainId}.identifier`} className={identifierClassName} placeholder={t('Identifikator')}/>

        {deleteFunc && <button type="button" className="px-4 py-2 rounded-r bg-red-500 text-white" onClick={deleteFunc}>-</button>}
      </div>

      <ErrorMessage name={`${mainId}.identifier`}>{msg => <p className="help is-danger">{msg}</p>}</ErrorMessage>

      <ErrorMessage name={`${mainId}.identifierType`}>{msg => <p className="help is-danger">{msg}</p>}</ErrorMessage>
    </>
  );
}
