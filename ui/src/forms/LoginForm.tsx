import {JSX, useState} from 'react';
import {LoginMutationVariables, useLoginMutation} from '../graphql';
import {useTranslation} from 'react-i18next';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import {forgotPasswordUrl, homeUrl} from '../urls';
import {Link, Navigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector, login} from '../newStore';
import {object as yupObject, Schema, string as yupString} from 'yup';
import {amberButtonClasses, blueButtonClasses, explTextClasses, inputClasses, redMessageClasses} from '../defaultDesign';

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

  if (useSelector(activeUserSelector)) { // User is already logged in
    return <Navigate to={homeUrl}/>;
  }

  async function handleSubmit(values: LoginMutationVariables): Promise<void> {
    try {
      const {data} = await loginMutation({variables: values});

      if (data?.login) {
        setInvalidLoginTry(false);
        dispatch(login(data.login));
      } else {
        setInvalidLoginTry(true);
      }
    } catch (e) {
      setInvalidLoginTry(false);
      console.error(e);
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center">{t('login')}</h1>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({touched, errors}) => <Form>

          <div className="my-4">
            <label htmlFor="username" className="font-bold">{t('username')}:</label>
            <Field name="username" id="username" placeholder={t('username')} required autoFocus
                   className={inputClasses(touched.username, errors.username)}/>
            <ErrorMessage name="username">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
          </div>

          <div className="my-4">
            <label htmlFor="password" className="font-bold">{t('password')}</label>
            <Field type="password" name="password" id="password" placeholder={t('password')} required
                   className={inputClasses(touched.password, errors.password)}/>
            <ErrorMessage name="password">{(msg) => <p className={explTextClasses}>{msg}</p>}</ErrorMessage>
          </div>

          {invalidLoginTry && <div className={redMessageClasses}>{t('invalidUsernamePasswordCombination')}.</div>}

          {error && <div className={redMessageClasses}>{error.message}</div>}

          <div className="my-4 text-center">
            <Link to={forgotPasswordUrl} className={amberButtonClasses}>{t('forgotPassword')}?</Link>
          </div>
          <div className="text-center">
            <button type="submit" disabled={loading} className={blueButtonClasses}>{t('login')}</button>
          </div>
        </Form>}
      </Formik>
    </div>
  );
}
