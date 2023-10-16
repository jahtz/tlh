import {ReactElement} from 'react';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import {useTranslation} from 'react-i18next';
import {amberMessageClasses, blueButtonClasses, explTextClasses, inputClasses, redMessageClasses} from '../defaultDesign';
import * as yup from 'yup';
import {ForgotPasswordMutationVariables, useForgotPasswordMutation} from '../graphql';

type BaseFormValues = Omit<ForgotPasswordMutationVariables, 'version'>;

const forgotPwFormSchema: yup.ObjectSchema<BaseFormValues> = yup.object({
  mail: yup.string().email().required()
}).required();

export function ForgotPasswordForm(): ReactElement {

  const {t} = useTranslation('common');
  const [forgotPassword, {data, loading, error}] = useForgotPasswordMutation();

  const onSubmit = async ({mail}: BaseFormValues): Promise<void> => {
    try {
      await forgotPassword({variables: {mail, version: process.env.REACT_APP_VERSION || ''}});
    } catch (exception) {
      console.error(exception);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="my-2 font-bold text-2xl text-center">{t('forgotPassword')}</h1>

      <Formik initialValues={{mail: ''}} validationSchema={forgotPwFormSchema} onSubmit={onSubmit}>
        {({touched, errors}) => <Form>

          <div className="my-4">
            <label htmlFor="mail" className="font-bold">{t('email')}:</label>
            <Field type="email" name="mail" id="mail" placeholder={t('email')} required className={inputClasses(!!touched.mail, !!errors.mail)}/>
            <ErrorMessage name="mail">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
          </div>

          {data?.forgotPassword && <div className={amberMessageClasses}>{t('emailSentIfUserExists')}</div>}

          {error && <div className={redMessageClasses}>{error.message}</div>}

          <div className="text-center">
            <button type="submit" className={blueButtonClasses} disabled={loading}>{t('submit')}</button>
          </div>
        </Form>}
      </Formik>
    </div>
  );
}