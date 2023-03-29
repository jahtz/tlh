import {useRegisterMutation, UserInput} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import {object as yupObject, Schema, string as yupString} from 'yup';
import classNames from 'classnames';

const initialValues: UserInput = {username: '', password: '', passwordRepeat: '', name: '', email: '', affiliation: ''};

const validationSchema: Schema<UserInput> = yupObject({
  username: yupString().min(4).max(50).required(),
  password: yupString().min(4).max(50).required(),
  passwordRepeat: yupString().min(4).max(50).required(),
  name: yupString().required(),
  email: yupString().email().required(),
  affiliation: yupString().notRequired()
}).required();

const redBorder = 'border-red-500';
const greenBorder = 'border-green-500';
const defaultBorder = 'border-slate-500';

export function RegisterForm(): JSX.Element {

  const {t} = useTranslation('common');
  const [register, {data, loading, error}] = useRegisterMutation();

  function onSubmit(values: UserInput): void {
    register({variables: {userInput: values}})
      .catch((e) => console.error(e));
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('register')}</h1>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({touched, errors}) =>
          <Form>
            <div className="mb-4">
              <label htmlFor="username" className="font-bold">{t('username')}:</label>
              <Field name="username" id="username" placeholder={t('username')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.username ? (errors.username ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="font-bold">{t('password')}:</label>
              <Field type="password" name="password" id="password" placeholder={t('password')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.password ? (errors.password ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            <div className="mb-4">
              <label htmlFor="passwordRepeat" className="font-bold">{t('passwordRepeat')}:</label>
              <Field type="password" name="passwordRepeat" id="passwordRepeat" placeholder={t('passwordRepeat')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.passwordRepeat ? (errors.passwordRepeat ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="font-bold">{t('name')}:</label>
              <Field name="name" id="name" placeholder={t('name')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.name ? (errors.name ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="font-bold">{t('email')}:</label>
              <Field type="email" name="email" placeholder={t('email')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.email ? (errors.email ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            <div className="mb-4">
              <label htmlFor="affiliation" className="font-bold">{t('affiliation')}:</label>
              <Field name="affiliation" id="affiliation" placeholder={t('affiliation')}
                     className={classNames('mt-2 p-2 rounded border w-full', touched.affiliation ? (errors.affiliation ? redBorder : greenBorder) : defaultBorder)}/>
            </div>

            {data?.register && <div className="p-4 rounded border border-green-600 bg-green-500 text-white text-center">
              {t('userRegistered{{who}}', {who: data.register})}.
            </div>}

            {error && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">{error.message}</div>}

            <button type="submit" disabled={loading || !!data?.register} className="mt-4 p-2 rounded border w-full bg-blue-500 text-white">
              {t('register')}
            </button>
          </Form>
        }
      </Formik>
    </div>
  );
}
