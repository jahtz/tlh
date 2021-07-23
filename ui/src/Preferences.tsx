import {Field, Form, Formik} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {EditorConfig} from './editor/editorConfig';
import {useDispatch, useSelector} from 'react-redux';
import {editorConfigSelector} from './store/store';
import {updatePreferencesAction} from './store/actions';

const splitKey = ',';

interface FormValues {
  nextNodeKeys: string;
  prevNodeKeys: string;
  submitKeys: string;
}

function dismantleFormEntry(entry: string): string[] {
  return Array.from(new Set(entry.split(splitKey).map((s) => s.trim()).filter((s) => s.length > 0)));
}

export function Preferences(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch();
  const currentEditorConfig: EditorConfig = useSelector(editorConfigSelector);

  const initialValues: FormValues = {
    nextNodeKeys: currentEditorConfig.nextEditableNodeKeys.join(splitKey),
    prevNodeKeys: currentEditorConfig.previousEditableNodeKeys.join(splitKey),
    submitKeys: currentEditorConfig.submitChangeKeys.join(splitKey)
  };

  function onSubmit(newConfig: FormValues): void {
    const {nextNodeKeys, prevNodeKeys, submitKeys} = newConfig;

    const nextEditableNodeKeys = dismantleFormEntry(nextNodeKeys);
    const previousEditableNodeKeys = dismantleFormEntry(prevNodeKeys);
    const submitChangeKeys = dismantleFormEntry(submitKeys);

    // TODO: change for intersections between sets!

    const newEditorConfig: EditorConfig = {nextEditableNodeKeys, previousEditableNodeKeys, submitChangeKeys};

    dispatch(updatePreferencesAction(newEditorConfig));
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('preferences')}</h1>

      <h2 className="subtitle is-4">{t('xmlEditor')}</h2>

      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        <Form>

          <div className="field">
            <label htmlFor="nextEditableNode" className="label">{t('nextEditableNode')}</label>
            <div className="control">
              <Field type="text" className="input" id="nextEditableNode" name="nextNodeKeys"/>
            </div>
          </div>

          <div className="field">
            <label htmlFor="previousEditableNode" className="label">{t('previousEditableNode')}</label>
            <div className="control">
              <Field type="text" className="input" id="previousEditableNode" name="prevNodeKeys"/>
            </div>
          </div>

          <div className="field">
            <label htmlFor="submitChangesKeys" className="label">{t('submitChangesKeys')}</label>
            <div className="control">
              <Field type="text" className="input" id="submitChangesKeys" name="submitKeys"/>
            </div>
          </div>

          <button type="submit" className="button is-link is-fullwidth">{t('updatePreferences')}</button>
        </Form>
      </Formik>

    </div>
  );
}