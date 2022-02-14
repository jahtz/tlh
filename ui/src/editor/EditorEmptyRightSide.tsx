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

  const insertableTags: [string, InsertablePositions][] = Object.entries(editorConfig.nodeConfigs)
    .map<[string, InsertablePositions | undefined]>(([tagName, {insertablePositions}]) => [tagName, insertablePositions])
    .filter((t): t is [string, InsertablePositions] => !!t[1]);

  return (
    <div>
      <h2 className="p2 text-center font-bold text-lg">{t('insertableElements')}</h2>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {insertableTags.map(([tagName, insertablePositions]) =>
          <InsertableTagButton key={tagName} tagName={tagName} currentInsertedElement={currentInsertedElement}
                               onClick={() => toggleElementInsert(tagName, insertablePositions)}/>
        )}
      </div>
    </div>
  );
}

interface InsertableTagButtonProps {
  tagName: string;
  currentInsertedElement?: string;
  onClick: () => void;
}

function InsertableTagButton({tagName, currentInsertedElement, onClick}: InsertableTagButtonProps): JSX.Element {

  const classes = classNames('p-2', 'rounded', 'border', 'border-slate-500', tagName === currentInsertedElement ? ['bg-blue-500', 'text-white'] : []);

  return (
    <button type="button" className={classes} onClick={onClick}>
      {tagName}
    </button>
  );
}