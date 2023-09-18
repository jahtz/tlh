import {ReactElement} from 'react';
import {Navigate, useSearchParams} from 'react-router-dom';
import {loginUrl} from '../urls';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import * as yup from 'yup';
import {useResetPasswordMutation} from '../graphql';
import {blueButtonClasses, greenMessageClasses, inputClasses, redMessageClasses} from '../defaultDesign';

interface FormValues {
  newPassword: string;
  newPasswordRepeat: string;
}

const validationSchema: yup.ObjectSchema<FormValues> = yup.object({
  newPassword: yup.string().min(4).required(),
  newPasswordRepeat: yup.string().min(4).required()
}).required();

const initialValues: FormValues = {newPassword: '', newPasswordRepeat: ''};

export function ResetPasswordForm(): ReactElement {

  const {t} = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [resetPassword, {data, loading, error}] = useResetPasswordMutation();

  const uuid = searchParams.get('uuid');

  if (uuid === null) {
    return <Navigate to={loginUrl}/>;
  }

  const onSubmit = async ({newPassword, newPasswordRepeat}: FormValues): Promise<void> => {
    console.info(newPassword + ' :: ' + newPasswordRepeat);

    if (newPassword !== newPasswordRepeat) {
      return;
    }

    try {
      await resetPassword({variables: {uuid, newPassword, newPasswordRepeat}});
    } catch (exception) {
      console.error(exception);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="my-4 font-bold text-2xl text-center">{t('resetPassword')}</h1>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({touched, errors}) => <Form>

          <div className="my-4">
            <label htmlFor="newPassword" className="font-bold">{t('password')}</label>
            <Field type="password" id="newPassword" name="newPassword" placeholder={t('newPassword')} required autoFocus
                   className={inputClasses(!!touched.newPassword, !!errors.newPassword)}/>
          </div>

          <div className="my-4">
            <label htmlFor="newPasswordRepeat" className="font-bold">{t('passwordRepeat')}</label>
            <Field type="password" id="newPaswordRepeat" name="newPasswordRepeat" placeholder={t('repeatNewPassword')} required
                   className={inputClasses(!!touched.newPasswordRepeat, !!errors.newPasswordRepeat)}/>
          </div>

          {data?.resetPassword && <div className={greenMessageClasses}>{t('passwordSuccessfullyReset')}!</div>}

          {error && <div className={redMessageClasses}>{error.message}</div>}

          <div className="text-center">
            <button type="submit" className={blueButtonClasses} disabled={loading}>{t('resetPassword')}</button>
          </div>
        </Form>}
      </Formik>
    </div>
  );
}