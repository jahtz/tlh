import {JSX, useState} from 'react';
import {TransliterationTextArea} from '../TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {TLHParser} from 'simtex';
import {Attributes, writeNode, xmlElementNode, xmlTextNode} from 'simple_xml';
import {tlhXmlEditorConfig} from '../../xmlEditor/tlhXmlEditorConfig';
import {ManuscriptIdentifierType} from '../../graphql';

export interface XmlCreationValues {
  mainIdentifier: string;
  mainIdentifierType: ManuscriptIdentifierType;
  author: string;
  creationDate: string;
  transliterationReleaseDate: string;
}

interface IProps extends XmlCreationValues {
  initialTransliteration: string;
  onConvert: (value: string) => void;
}

const defaultAoXmlAttributes: Attributes = {
  'xmlns:hpm': 'http://hethiter.net/ns/hpm/1.0',
  'xmlns:AO': 'http://hethiter.net/ns/AO/1.0',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  'xmlns:meta': 'urn:oasis:names:tc:opendocument:xmlns:meta:1.0',
  'xmlns:text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  'xmlns:table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  'xmlns:draw': 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  'xml:space': 'preserve'
};

const manuscriptIdentifierTag = (identifierType: ManuscriptIdentifierType): string => ({
  [ManuscriptIdentifierType.CollectionNumber]: 'AO:InvNr',
  [ManuscriptIdentifierType.PublicationShortReference]: 'AO:TxtPubl',
  [ManuscriptIdentifierType.ExcavationNumber]: 'AO:ExcNr'
}[identifierType]);

export function TransliterationCheck({
  mainIdentifier,
  mainIdentifierType,
  author,
  creationDate,
  transliterationReleaseDate,
  initialTransliteration,
  onConvert
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialTransliteration);

  const onSubmit = (): void => {
    const document = xmlElementNode('AOxml', defaultAoXmlAttributes, [
      xmlElementNode('AOHeader', {}, [
        xmlElementNode('docID', {}, [xmlTextNode(mainIdentifier)]),
        xmlElementNode('meta', {}, [
          xmlElementNode('author', {author, date: creationDate}),
          xmlElementNode('creation-date', {date: transliterationReleaseDate}),
        ])
      ]),
      xmlElementNode('body', {}, [
        xmlElementNode('div1', {type: 'transliteration'}, [
          xmlElementNode('AO:Manuscripts', {}, [
            xmlElementNode(manuscriptIdentifierTag(mainIdentifierType), {}, [xmlTextNode(mainIdentifier)])
          ]),
          xmlElementNode('text', {},
            new TLHParser(input).exportXML().flat()
          )
        ])
      ])
    ]);

    onConvert(
      writeNode(document, tlhXmlEditorConfig.writeConfig).join('\n')
    );
  };

  return (
    <>
      <TransliterationTextArea input={input} onChange={setInput} disabled={false}/>

      <button type="button" onClick={onSubmit} disabled={false} className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
        {t('convertToXml')}
      </button>
    </>
  );
}