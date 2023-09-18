import {ChangeEvent, ReactElement} from 'react';
import {XmlNode} from 'simple_xml';
import {reconstructTransliterationForNodes} from '../../transliterationReconstruction';
import {readTransliteration, WordContentEditState} from './WordContentEditor';
import {useTranslation} from 'react-i18next';
import {redMessageClasses} from '../../../defaultDesign';

interface IProps {
  childNodes: XmlNode[];
  language: string;
  onNewParseResult: (content: WordContentEditState) => void;
}

export function WordWithoutLbContentEditor({childNodes, language, onNewParseResult}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const {reconstruction, warnings} = reconstructTransliterationForNodes(childNodes);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => onNewParseResult(readTransliteration(event.target.value, language));

  return (
    <div>
      {warnings.length > 0 && <div className={redMessageClasses}>
        <p className="font-bold">{t('errorWhileTransliterationReconstruction')}:</p>
        <pre>{warnings}</pre>
      </div>}

      <div className="flex">
        <label htmlFor="newTransliteration" className="p-2 rounded-l border-l border-y border-slate-500 font-bold">
          {t('newTransliteration')} ({t('language')}: {language}):
        </label>

        <input defaultValue={reconstruction} id="newTransliteration" className="flex-grow p-2 rounded-r border border-slate-500"
               placeholder={t('newTransliteration')} onChange={onChange}/>
      </div>
    </div>
  );
}