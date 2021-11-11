import {Field, Form, Formik} from 'formik';
import {useTranslation} from 'react-i18next';
import {EditorKeyConfig} from './editor/editorKeyConfig';
import {useDispatch, useSelector} from 'react-redux';
import {editorKeyConfigSelector} from './store/store';
import {updatePreferencesAction} from './store/actions';
import {useState} from 'react';

const splitKey = ',';

interface FormValues {
  updateAndNextNodeKeys: string;
  nextNodeKeys: string;
  updateAndPrevNodeKeys: string;
  prevNodeKeys: string;
  submitKeys: string;
}

function dismantleFormEntry(entry: string): string[] {
  return Array.from(
    new Set(
      entry.split(splitKey)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  );
}

export function Preferences(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch();
  const currentEditorConfig: EditorKeyConfig = useSelector(editorKeyConfigSelector);
  const [updated, setUpdated] = useState(false);

  const initialValues: FormValues = {
    updateAndNextNodeKeys: currentEditorConfig.updateAndNextEditableNodeKeys.join(splitKey),
    nextNodeKeys: currentEditorConfig.nextEditableNodeKeys.join(splitKey),
    updateAndPrevNodeKeys: currentEditorConfig.updateAndPreviousEditableNodeKeys.join(splitKey),
    prevNodeKeys: currentEditorConfig.previousEditableNodeKeys.join(splitKey),
    submitKeys: currentEditorConfig.submitChangeKeys.join(splitKey)
  };

  function onSubmit(newConfig: FormValues): void {
    const {updateAndNextNodeKeys, nextNodeKeys, updateAndPrevNodeKeys, prevNodeKeys, submitKeys} = newConfig;

    const updateAndNextEditableNodeKeys = dismantleFormEntry(updateAndNextNodeKeys);
    const nextEditableNodeKeys = dismantleFormEntry(nextNodeKeys);
    const updateAndPreviousEditableNodeKeys = dismantleFormEntry(updateAndPrevNodeKeys);
    const previousEditableNodeKeys = dismantleFormEntry(prevNodeKeys);
    const submitChangeKeys = dismantleFormEntry(submitKeys);

    const differentKeysUsed = Array.from(
      new Set([
        ...updateAndNextEditableNodeKeys,
        ...nextEditableNodeKeys,
        ...updateAndPreviousEditableNodeKeys,
        ...previousEditableNodeKeys,
        ...submitChangeKeys
      ])
    );

    const completeKeysUsedCount = updateAndNextEditableNodeKeys.length
      + nextEditableNodeKeys.length
      + updateAndPreviousEditableNodeKeys.length
      + previousEditableNodeKeys.length
      + submitChangeKeys.length;

    if (differentKeysUsed.length !== completeKeysUsedCount) {
      alert(t('keyDefinitionOverlapping'));
      return;
    }

    dispatch(
      updatePreferencesAction({
        updateAndNextEditableNodeKeys,
        nextEditableNodeKeys,
        updateAndPreviousEditableNodeKeys,
        previousEditableNodeKeys,
        submitChangeKeys
      })
    );

    setUpdated(true);
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('preferences')}</h1>

      <h2 className="subtitle is-4">{t('xmlEditor')}</h2>

      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        <Form>

          <div className="field">
            <label htmlFor="updateAndNextNodeKeys" className="label">{t('updateAndNextEditableNode')}</label>
            <div className="control">
              <Field type="text" className="input" id="updateAndNextNodeKeys" name="updateAndNextNodeKeys"/>
            </div>
          </div>

          <div className="field">
            <label htmlFor="nextEditableNode" className="label">{t('nextEditableNode')}</label>
            <div className="control">
              <Field type="text" className="input" id="nextEditableNode" name="nextNodeKeys"/>
            </div>
          </div>

          <div className="field">
            <label htmlFor="updateAndPrevEditableNode" className="label">{t('updateAndPrevEditableNode')}</label>
            <div className="control">
              <Field type="text" className="input" id="updateAndPrevEditableNode" name="updateAndPrevNodeKeys"/>
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

          {updated && <div className="notification is-success has-text-centered">{t('preferencesUpdated')}</div>}

          <button type="submit" className="button is-link is-fullwidth">{t('updatePreferences')}</button>
        </Form>
      </Formik>

    </div>
  );
}