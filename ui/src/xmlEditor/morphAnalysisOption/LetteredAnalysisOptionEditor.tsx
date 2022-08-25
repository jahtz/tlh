import {useTranslation} from 'react-i18next';
import {Field, FieldArrayRenderProps} from 'formik';

interface IProps {
  preName: string;
  letter: string;
  index: number;
  arrayHelpers: FieldArrayRenderProps;
}

export function LetteredAnalysisOptionEditor({preName, letter, index, arrayHelpers}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="mt-2 flex flex-row">
      <button className="px-4 py-2 rounded-l bg-gray-100 border-l border-y border-slate-500">{letter}</button>
      <Field name={`${preName}.${index}.analysis`} className="flex-grow p-2 border-l border-y border-slate-500"
             placeholder={t('analysis')}/>
      <button type="button" className="px-4 py-2 rounded-r bg-red-500 text-white" onClick={() => arrayHelpers.remove(index)}>-</button>
    </div>
  );
}