import React, {Dispatch, useState} from 'react';
import {LoginMutationVariables, useLoginMutation} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';
import {BulmaField} from './BulmaFields';
import {loginSchema} from './schemas';
import classnames from 'classnames';
import {homeUrl} from '../urls';
import {Redirect} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {StoreAction, userLoggedInAction} from '../store/actions';
import {activeUserSelector} from '../store/store';

const initialValues: LoginMutationVariables = {username: '', password: ''};

export function LoginForm(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch<Dispatch<StoreAction>>();
  const [invalidLoginTry, setInvalidLoginTry] = useState(false);
  const [login, {loading, error}] = useLoginMutation();

  if (useSelector(activeUserSelector)) { // User is already logged in
    return <Redirect to={homeUrl}/>;
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
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('login')}</h1>

      <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
        <Form>
          <Field name="username" id="username" label={t('username')} component={BulmaField}/>

          <Field type="password" name="password" id="password" label={t('password')} component={BulmaField}/>

          {invalidLoginTry && <div className="notification is-warning has-text-centered">
            {t('invalidUsernamePasswordCombination')}.
          </div>}

          {error && <div className="notification is-danger has-text-centered">{error.message}</div>}

          <div className="field">
            <button type="submit" disabled={loading} className={classnames('button', 'is-link', 'is-fullwidth', {'is-loading': loading})}>
              {t('login')}
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
