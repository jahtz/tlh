import {ReactElement, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {isXmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {ParagraphLanguageType, StatusLevel, Word} from 'simtex';
import {myError, myOk, MyResult} from '../../../newResult';
import {WordWithLbContentEditor} from './WordWithLbContentEditor';
import {WordWithoutLbContentEditor} from './WordWithoutLbContentEditor';
import classNames from 'classnames';
import {ParsedWord} from './ParsedWord';
import {amberButtonClasses} from '../../../defaultDesign';

interface IProps {
  oldNode: XmlElementNode<'w'>;
  language: string;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode<'w'>) => void;
}

const convertLangauge = (language: string): ParagraphLanguageType | null => {
  return {
    'Akk': ParagraphLanguageType.Akk,
    'Sum': ParagraphLanguageType.Sum,
    'Luw': ParagraphLanguageType.Luw,
    'Pal': ParagraphLanguageType.Pal,
    'Hur': ParagraphLanguageType.Hur,
    'Hat': ParagraphLanguageType.Hat,
    'Hit': ParagraphLanguageType.Hit
  }[language] || null;
};

export type WordContentEditState = MyResult<XmlElementNode<'w'>, string[]>;

export function readTransliteration(transliteration: string, language: string): WordContentEditState {
  const word = Word.parseWord(convertLangauge(language), transliteration);

  if (!(word instanceof Word)) {
    return myError([]);
  }

  return word.getStatus().getLevel() === StatusLevel.ok
    ? myOk(word.exportXml() as XmlElementNode<'w'>)
    : myError(word.getStatus().getEvents().map((event) => event.getMessage()));
}

type SplitAtLbResult = { preLbContent: XmlNode[], lbNode: XmlElementNode, postLbContent: XmlNode[] };

function splitAtLbTag(children: XmlNode[]): SplitAtLbResult | undefined {
  const lbTagIndex = children.findIndex((node) => isXmlElementNode(node) && node.tagName === 'lb');

  if (lbTagIndex === -1) {
    return undefined;
  } else {
    return {
      preLbContent: children.slice(0, lbTagIndex),
      lbNode: children[lbTagIndex] as XmlElementNode,
      postLbContent: children.slice(lbTagIndex + 1, children.length)
    };
  }
}

export function WordContentEditor({oldNode, language, cancelEdit, updateNode}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const maybeSplit = splitAtLbTag(oldNode.children);

  const [state, setState] = useState<WordContentEditState | undefined>(
    // FIXME: initial state!
    // maybeSplit ? undefined : undefined
  );

  return (
    <div>
      {maybeSplit
        ? <WordWithLbContentEditor {...maybeSplit} language={language} onNewParseResult={setState}/>
        : <WordWithoutLbContentEditor childNodes={oldNode.children} language={language} onNewParseResult={setState}/>}

      {state && <div className="mt-4 rounded-t">
        <div className={classNames('p-2 rounded-t text-white font-bold', state.status ? 'bg-green-500' : 'bg-red-600')}>{t('result')}</div>
        <div className={classNames('p-4', state.status ? 'bg-green-50' : 'bg-red-200')}>
          {state.status
            ? <ParsedWord key={JSON.stringify(state.value)} oldAttributes={oldNode.attributes} initialParsedWord={state.value} language={language}
                          submitEdit={updateNode}/>
            : <pre>{JSON.stringify(state, null, 2)}</pre>}
        </div>
      </div>}

      <div className="text-center">
        <button type="button" onClick={cancelEdit} className={amberButtonClasses}>{t('cancelEdit')}</button>
      </div>
    </div>
  );
}
