import {useState} from 'react';
import {LoginMutationVariables, useLoginMutation} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import {homeUrl} from '../urls';
import {Navigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector, login} from '../newStore';
import {object as yupObject, Schema, string as yupString} from 'yup';
import {borderColors} from './colors';
import classNames from 'classnames';

const initialValues: LoginMutationVariables = {username: '', password: ''};

const validationSchema: Schema<LoginMutationVariables> = yupObject({
  username: yupString().min(4).max(50).required(),
  password: yupString().min(4).max(50).required()
}).required();


export function LoginForm(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch();
  const [invalidLoginTry, setInvalidLoginTry] = useState(false);
  const [loginMutation, {loading, error}] = useLoginMutation();

  if (useSelector(activeUserSelector)) {
    // User is already logged in
    return <Navigate to={homeUrl}/>;
  }

  function handleSubmit(values: LoginMutationVariables): void {
    loginMutation({variables: values})
      .then(({data}) => {
        if (data && data.login) {
          setInvalidLoginTry(false);
          dispatch(login(data.login));
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

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({touched, errors}) => <Form>

          <div className="my-4">
            <label htmlFor="username" className="font-bold">{t('username')}:</label>
            <Field name="username" id="username" placeholder={t('username')} required autoFocus
                   className={classNames('mt-2', 'p-2', 'rounded', 'border', 'w-full',
                     touched.username ? (errors.username ? borderColors.error : borderColors.success) : borderColors.default)}/>
          </div>

          <div className="my-4">
            <label htmlFor="password" className="font-bold">{t('password')}</label>
            <Field type="password" name="password" id="password" placeholder={t('password')} required
                   className={classNames('mt-2', 'p-2', 'rounded', 'border', 'w-full',
                     touched.password ? (errors.password ? borderColors.error : borderColors.success) : borderColors.default)}/>
          </div>

          {invalidLoginTry && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">
            {t('invalidUsernamePasswordCombination')}.
          </div>}

          {error && <div className="p-4 rounded border border-red-600 bg-red-500 text-white text-center">{error.message}</div>}

          <button type="submit" disabled={loading} className="mt-4 p-2 rounded border w-full bg-blue-500 text-white">
            {t('login')}
          </button>
        </Form>}
      </Formik>
    </div>
  );
}
