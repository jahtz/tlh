import {useRegisterMutation, UserInput} from '../graphql';
import {useTranslation} from 'react-i18next';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as yup from 'yup';
import {ReactElement} from 'react';
import {blueButtonClasses, explTextClasses, greenMessageClasses, inputClasses, redMessageClasses} from '../defaultDesign';

const initialValues: UserInput = {username: '', password: '', passwordRepeat: '', name: '', email: '', affiliation: ''};

const validationSchema: yup.ObjectSchema<UserInput> = yup.object({
  username: yup.string().min(4).max(50).required(),
  password: yup.string().min(4).max(50).required(),
  passwordRepeat: yup.string().min(4).max(50).required(),
  name: yup.string().required(),
  email: yup.string().email().required(),
  affiliation: yup.string().notRequired()
}).required();

export function RegisterForm(): ReactElement {

  const {t} = useTranslation('common');
  const [register, {data, loading, error}] = useRegisterMutation();

  const onSubmit = async (values: UserInput): Promise<void> => {
    try {
      await register({variables: {userInput: values}});
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('register')}</h1>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({touched, errors}) =>
          <Form>
            <div className="mb-4">
              <label htmlFor="username" className="font-bold">{t('username')}:</label>
              <Field name="username" id="username" placeholder={t('username')} required autoFocus
                     className={inputClasses(!!touched.username, !!errors.username)}/>
              <ErrorMessage name="username">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="font-bold">{t('password')}:</label>
              <Field type="password" name="password" id="password" placeholder={t('password')} required
                     className={inputClasses(!!touched.password, !!errors.password)}/>
              <ErrorMessage name="password">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            <div className="mb-4">
              <label htmlFor="passwordRepeat" className="font-bold">{t('passwordRepeat')}:</label>
              <Field type="password" name="passwordRepeat" id="passwordRepeat" placeholder={t('passwordRepeat')} required
                     className={inputClasses(!!touched.passwordRepeat, !!errors.passwordRepeat)}/>
              <ErrorMessage name="passwordRepeat">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="font-bold">{t('name')}:</label>
              <Field name="name" id="name" placeholder={t('name')} required className={inputClasses(!!touched.name, !!errors.name)}/>
              <ErrorMessage name="name">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="font-bold">{t('email')}:</label>
              <Field type="email" name="email" placeholder={t('email')} required className={inputClasses(!!touched.email, !!errors.email)}/>
              <ErrorMessage name="email">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            <div className="mb-4">
              <label htmlFor="affiliation" className="font-bold">{t('affiliation')}:</label>
              <Field name="affiliation" id="affiliation" placeholder={t('affiliation')} className={inputClasses(!!touched.affiliation, !!errors.affiliation)}/>
              <ErrorMessage name="affiliation">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
            </div>

            {data?.register && <div className={greenMessageClasses}>{t('userRegistered{{who}}', {who: data.register})}.</div>}

            {error && <div className={redMessageClasses}>{error.message}</div>}

            <div className="text-center">
              <button type="submit" disabled={loading || !!data?.register} className={blueButtonClasses}>{t('register')}</button>
            </div>
          </Form>
        }
      </Formik>
    </div>
  );
}
