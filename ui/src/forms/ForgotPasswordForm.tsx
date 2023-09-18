import {ReactElement} from 'react';
import {Field, Form, Formik} from 'formik';
import {useTranslation} from 'react-i18next';
import {blueButtonClasses} from '../defaultDesign';
import * as yup from 'yup';
import classNames from 'classnames';
import {useForgotPasswordMutation} from '../graphql';

interface FormValues {
  mail: string;
}

const forgotPwFormSchema = yup.object({
  mail: yup.string().email().required()
}).required();

const initialValues: FormValues = {mail: ''};

export function ForgotPasswordForm(): ReactElement {

  const {t} = useTranslation('common');
  const [forgotPassword, {data, loading, error}] = useForgotPasswordMutation();

  const onSubmit = async ({mail}: FormValues): Promise<void> => {
    try {
      await forgotPassword({variables: {mail}});
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
            <Field type="email" name="mail" id="mail" placeholder={t('email')}
                   className={classNames('my-2 p-2 rounded border w-full', touched.mail && errors.mail ? 'border-red-500' : 'border-slate-500 ')}/>
            {errors.mail && <p>{errors.mail}</p>}
          </div>

          {data?.forgotPassword && <div className="my-4">{t('emailSentIfUserExists')}</div>}

          {error && <div className="my-4">{error.message}</div>}

          <div className="text-center">
            <button type="submit" className={blueButtonClasses} disabled={loading}>{t('submit')}</button>
          </div>
        </Form>}
      </Formik>
    </div>
  );
}