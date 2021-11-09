import {XmlEditorConfig} from './editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {InsertablePositions} from './insertablePositions';

interface IProps {
  editorConfig: XmlEditorConfig;
  currentInsertedElement?: string;
  toggleElementInsert: (tagName: string, ip: InsertablePositions) => void;
}

export function EditorEmptyRightSide({editorConfig, currentInsertedElement, toggleElementInsert}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const insertableTags: [string, InsertablePositions][] = Object.entries(editorConfig)
    .map<[string, InsertablePositions | undefined]>(([tagName, {insertablePositions}]) => [tagName, insertablePositions])
    .filter((t): t is [string, InsertablePositions] => !!t[1]);

  return (
    <>
      <h2 className="subtitle is-5 has-text-centered">{t('insertableElements')}</h2>

      <div className="columns is-multiline">
        {insertableTags.map(([tagName, insertablePositions]) => <div key={tagName} className="column is-one-quarter">
          <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': tagName === currentInsertedElement})}
                  onClick={() => toggleElementInsert(tagName, insertablePositions)}>
            {tagName}
          </button>
        </div>)}
      </div>
    </>
  );
}