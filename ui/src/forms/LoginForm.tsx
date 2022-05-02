import {useState} from 'react';
import {LoginMutationVariables, useLoginMutation} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import {MyField} from './BulmaFields';
import {loginSchema} from './schemas';
import {homeUrl} from '../urls';
import {Navigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {userLoggedInAction} from '../store/actions';
import {activeUserSelector} from '../store/store';

const initialValues: LoginMutationVariables = {username: '', password: ''};

export function LoginForm(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch();
  const [invalidLoginTry, setInvalidLoginTry] = useState(false);
  const [login, {loading, error}] = useLoginMutation();

  if (useSelector(activeUserSelector)) { // User is already logged in
    return <Navigate to={homeUrl}/>;
  }

  function handleSubmit(values: LoginMutationVariables): void {
    login({variables: values})
      .then(({data}) => {
        if (data && data.login) {
          setInvalidLoginTry(false);
          dispatch(userLoggedInAction(data.login));
        } else {
          setInvalidLoginTry(true);
        }
      })
      .catch((e) => {
        setInvalidLoginTry(false);
        console.error(e);
      });
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('login')}</h1>

      <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
        <Form>
          <Field name="username" id="username" label={t('username')} component={MyField}/>

          <Field type="password" name="password" id="password" label={t('password')} component={MyField}/>

          {invalidLoginTry && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">
            {t('invalidUsernamePasswordCombination')}.
          </div>}

          {error && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">{error.message}</div>}

          <button type="submit" disabled={loading} className="mt-4 p-2 rounded border w-full bg-blue-500 text-white">
            {t('login')}
          </button>
        </Form>
      </Formik>
    </div>
  );
}
