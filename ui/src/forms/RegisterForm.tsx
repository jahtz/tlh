import {useRegisterMutation, UserInput} from '../graphql';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik, FormikHelpers} from 'formik';
import {registerSchema} from './schemas';
import {BulmaField} from './BulmaFields';
import classnames from 'classnames';

const initialValues: UserInput = {username: '', password: '', passwordRepeat: '', name: '', email: '', affiliation: ''};

export function RegisterForm(): JSX.Element {

  const {t} = useTranslation('common');
  const [register, {data, loading, error}] = useRegisterMutation();

  function onSubmit(values: UserInput, {setSubmitting}: FormikHelpers<UserInput>): void {
    register({variables: {userInput: values}})
      .catch((e) => console.error(e));

    setSubmitting(false);
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('register')}</h1>

      <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={onSubmit}>
        <Form>
          <Field name="username" id="username" label={t('username')} component={BulmaField}/>

          <Field type="password" name="password" id="password" label={t('password')} component={BulmaField}/>

          <Field type="password" name="passwordRepeat" id="passwordRepeat" label={t('passwordRepeat')} component={BulmaField}/>

          <Field name="name" id="name" label={t('name')} component={BulmaField}/>

          <Field type="email" name="email" label={t('email')} component={BulmaField}/>

          <Field name="affiliation" id="affiliation" label={t('affiliation')} component={BulmaField}/>

          {data?.register && <div className="notification is-success has-text-centered">
            {t('userRegistered{{who}}', {who: data.register})}.
          </div>}

          {error && <div className="notification is-danger has-text-centered">{error.message}</div>}

          <div className="field">
            <button type="submit" disabled={loading || !!data?.register} className={classnames('button', 'is-link', 'is-fullwidth', {'is-loading': loading})}>
              {t('register')}
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
