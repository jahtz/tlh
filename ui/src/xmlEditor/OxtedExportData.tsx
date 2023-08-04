import {ReactElement, useState} from 'react';
import classNames from 'classnames';
import {allDocEditTypes, attributesForDocEditType, DocumentEditTypes, nameForDocEditType} from './documentEditTypes';
import {useTranslation} from 'react-i18next';
import {Attributes, xmlElementNode, XmlElementNode} from 'simple_xml';
import update from 'immutability-helper';
import {defaultInputClasses} from '../defaultDesign';

interface IProps {
  setExportNode: (node: XmlElementNode) => void;
}

interface IState {
  editor: string | undefined;
  editType: DocumentEditTypes;
  attributes: Attributes;
}

const defaultEditType = DocumentEditTypes.Annotation;

const defaultState: IState = {editor: undefined, editType: defaultEditType, attributes: attributesForDocEditType(defaultEditType)};

export function OxtedExportData({setExportNode}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [{editor, editType, attributes}, setState] = useState<IState>(defaultState);

  const onChangeEditor = (editor: string): void => {
    setState((state) => update(state, {editor: {$set: editor}}));
    setExportNode(xmlElementNode(editType, {editor, date: (new Date()).toISOString(), ...attributes}));
  };

  const onChangeEditType = (editType: DocumentEditTypes): void => {
    const attributes = attributesForDocEditType(editType);
    setState((state) => update(state, {editType: {$set: editType}, attributes: {$set: attributes}}));
    setExportNode(xmlElementNode(editType, {editor, date: (new Date()).toISOString(), ...attributes}));
  };

  const onChangeAttribute = (key: string, value: string): void => {
    setState((state) => update(state, {attributes: {[key]: {$set: value}}}));
    setExportNode(xmlElementNode(editType, {editor, date: (new Date()).toISOString(), ...attributes}));
  };

  return (
    <div className="my-4 p-2 rounded border border-slate-500">
      <h2 className="text-center font-bold">{t('exportData')}</h2>

      <div>
        <label htmlFor="editor" className="font-bold">{t('editor')}:</label>
        <input type="text" id="editor" defaultValue={editor} placeholder={t('editor')}
               className={classNames('my-2 p-2 rounded border w-full', editor === undefined ? 'border-red-500' : 'border-slate-500')}
               onChange={(event) => onChangeEditor(event.target.value)}/>
      </div>

      <div>
        <label htmlFor="editType" className="font-bold">{t('editType')}:</label>
        <select id="editType" className="my-2 p-2 rounded border border-slate-500 bg-white w-full" defaultValue={editType}
                onChange={(event) => onChangeEditType(event.target.value as DocumentEditTypes)}>
          {allDocEditTypes.map((docEditType) => <option key={docEditType}>{nameForDocEditType(docEditType, t)}</option>)}
        </select>
      </div>

      {Object.entries(attributes).map(([key, value]) => <div key={key}>
        <label htmlFor={key} className="font-bold">{key}:</label>
        <input type="text" className={defaultInputClasses} defaultValue={value} placeholder={key}
               onChange={(event) => onChangeAttribute(key, event.target.value)}/>
      </div>)}
    </div>
  );
}