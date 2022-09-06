import {useRegisterMutation, UserInput} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import {MyField} from './BulmaFields';
import {object as yupObject, SchemaOf, string as yupString} from 'yup';

const initialValues: UserInput = {username: '', password: '', passwordRepeat: '', name: '', email: '', affiliation: ''};

const validationSchema: SchemaOf<UserInput> = yupObject({
  username: yupString().min(4).max(50).required(),
  password: yupString().min(4).max(50).required(),
  passwordRepeat: yupString().min(4).max(50).required(),
  name: yupString().required(),
  email: yupString().email().required(),
  affiliation: yupString().notRequired()
}).required();

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
        <Form>
          <Field name="username" id="username" label={t('username')} component={MyField}/>

          <Field type="password" name="password" id="password" label={t('password')} component={MyField}/>

          <Field type="password" name="passwordRepeat" id="passwordRepeat" label={t('passwordRepeat')} component={MyField}/>

          <Field name="name" id="name" label={t('name')} component={MyField}/>

          <Field type="email" name="email" label={t('email')} component={MyField}/>

          <Field name="affiliation" id="affiliation" label={t('affiliation')} component={MyField}/>

          {data?.register && <div className="p-4 rounded border border-green-600 bg-green-500 text-white text-center">
            {t('userRegistered{{who}}', {who: data.register})}.
          </div>}

          {error && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">{error.message}</div>}

          <button type="submit" disabled={loading || !!data?.register} className="mt-4 p-2 rounded border w-full bg-blue-500 text-white">
            {t('register')}
          </button>
        </Form>
      </Formik>
    </div>
  );
}
