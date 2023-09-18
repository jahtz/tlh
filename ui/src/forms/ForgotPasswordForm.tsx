import {ReactElement} from 'react';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import {useTranslation} from 'react-i18next';
import {amberMessageClasses, blueButtonClasses, explTextClasses, inputClasses, redMessageClasses} from '../defaultDesign';
import * as yup from 'yup';
import {ForgotPasswordMutationVariables, useForgotPasswordMutation} from '../graphql';

const forgotPwFormSchema: yup.ObjectSchema<ForgotPasswordMutationVariables> = yup.object({
  mail: yup.string().email().required()
}).required();

const initialValues: ForgotPasswordMutationVariables = {mail: ''};

export function ForgotPasswordForm(): ReactElement {

  const {t} = useTranslation('common');
  const [forgotPassword, {data, loading, error}] = useForgotPasswordMutation();

  const onSubmit = async (variables: ForgotPasswordMutationVariables): Promise<void> => {
    try {
      await forgotPassword({variables});
    } catch (exception) {
      console.error(exception);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="my-2 font-bold text-2xl text-center">{t('forgotPassword')}</h1>

      <Formik initialValues={initialValues} validationSchema={forgotPwFormSchema} onSubmit={onSubmit}>
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