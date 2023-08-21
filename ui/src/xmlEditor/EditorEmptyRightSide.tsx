import {isXmlSingleInsertableEditableNodeConfig, XmlEditorConfig, XmlSingleInsertableEditableNodeConfig} from './editorConfig';
import {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {InsertablePositions} from './insertablePositions';
import {SelectableButton} from '../genericElements/Buttons';
import {amberButtonClasses, blueButtonClasses} from '../defaultDesign';

interface IProps {
  editorConfig: XmlEditorConfig;
  currentInsertedElement?: string;
  toggleElementInsert: (tagName: string, ip: InsertablePositions) => void;
  toggleCompareChanges: () => void;
  onExportXml: () => void;
  exportDisabled: boolean;
  otherButton: ReactElement | undefined;
  children: ReactElement | undefined;
}

export function EditorEmptyRightSide({
  editorConfig,
  currentInsertedElement,
  toggleElementInsert,
  toggleCompareChanges,
  onExportXml,
  exportDisabled,
  otherButton,
  children
}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const insertableTags: [string, InsertablePositions][] = Object.entries(editorConfig.nodeConfigs)
    .filter((c): c is [string, XmlSingleInsertableEditableNodeConfig] => isXmlSingleInsertableEditableNodeConfig(c[1]))
    .map<[string, InsertablePositions]>(([tagName, {insertablePositions}]) => [tagName, insertablePositions]);

  return (
    <div>
      <section className="p-2 rounded border border-slate-500">
        <h2 className="p-2 text-center font-bold text-lg">{t('insertableElements')}</h2>

        <div className="my-4 grid grid-cols-4 gap-2">
          {insertableTags.map(([tagName, insertablePositions]) =>
            <SelectableButton key={tagName} title={tagName} selected={tagName === currentInsertedElement}
                              onClick={() => toggleElementInsert(tagName, insertablePositions)} otherClasses={['p-2', 'rounded']}>
              <>{tagName}</>
            </SelectableButton>
          )}
        </div>
      </section>

      {children}

      <div className="mt-4 flex space-x-4 justify-center">
        <button type="button" className={amberButtonClasses} onClick={toggleCompareChanges}>{t('compareChanges')}</button>
        <button type="button" className={blueButtonClasses} onClick={onExportXml} disabled={exportDisabled}>{t('exportXml')}</button>
        {otherButton}
      </div>
    </div>
  );
}
