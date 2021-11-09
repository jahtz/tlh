import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {Field, Form, Formik} from 'formik';

export function LineBreakEditor({
  data,
  updateNode,
  deleteNode,
  jumpEditableNodes,
  setKeyHandlingEnabled
}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  function onSubmit(attributes: Record<string, string>): void {
    // TODO: updateNode({...node, attributes});
  }

  return (
    <Formik initialValues={data.attributes} onSubmit={onSubmit}>
      <Form>

        <div className="field">
          <label htmlFor="txtid" className="label">{t('textId')}:</label>
          <div className="control">
            <Field type="text" name="txtid" id="txtid" className="input" readOnly/>
          </div>
        </div>

        <div className="field">
          <label htmlFor="lnr" className="label">{t('lineNumber')}:</label>
          <div className="control">
            <Field type="text" name="lnr" id="lnr" className="input" onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}/>
          </div>
        </div>

        <div className="field">
          <label htmlFor="lg" className="label">{t('language')}</label>
          <div className="control">
            <Field type="text" name="lg" id="lg" className="input" onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}/>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <button type="button" className="button is-danger is-fullwidth" onClick={deleteNode}>{t('delete')}</button>
          </div>
          <div className="column">
            <button type="submit" className="button is-link is-fullwidth">{t('update')}</button>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <button className="button is-fullwidth" onClick={() => jumpEditableNodes(data.tagName, false)}>{t('previousEditable')}</button>
          </div>
          <div className="column">
            <button className="button is-fullwidth" onClick={() => jumpEditableNodes(data.tagName, true)}>{t('nextEditable')}</button>
          </div>
        </div>

      </Form>
    </Formik>
  );
}