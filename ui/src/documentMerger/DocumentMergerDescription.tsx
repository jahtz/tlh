import {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';

const englishDescription = [
  'The Document Merger allows the user to execute a merge between two XML transliterations of fragments that have been identified as belonging to the same tablet.',
  'The transliteration containing the beginning of the adjoining lines should be loaded first (choose the desired XML file), and will appear on the left.',
  'The transliteration with the end of the adjoining lines should be opened second. Once both XML files are loaded, the arrows and number beside "offset" can be used to shift the entire transliteration on the right down (or then up again).',
  'Alternatively, the entire text on either side can be moved using click and drag.',
  'Individual lines on the left or right can be inserted using the "+" button; unwanted empty lines can be deleted with the "-" button.'
];

const germanDescription = [
  'Die Textzusammenschluss-Tool ermöglicht es dem Benutzer, zwei XML-Transliterationen von Fragmenten, die zur gleichen Tafel gehören, zusammenzuführen.',
  'Die Transliteration, die den Anfang der aneinander grenzenden Zeilen enthält, muss zuerst geladen werden (wählen Sie die gewünschte XML-Datei) und erscheint auf der linken Seite.',
  'Die Transliteration mit dem Ende der aneinandergrenzenden Zeilen sollte als zweites geöffnet werden.',
  'Sobald beide XML-Dateien geladen sind, können Sie mit den Pfeilen bzw. der Zahl im Balken “Ausgleichen" die gesamte Transliteration auf der rechten Seite nach unten (oder wieder nach oben) verschieben.',
  'Alternativ kann auch der gesamte Text auf beiden Seiten durch Klicken und Ziehen verschoben werden.',
  'Einzelne Zeilen auf der linken oder rechten Seite können mit dem Button "+" eingefügt werden, unerwünschte Leerzeilen können mit dem Button "-" gelöscht werden.'
];

const getDescription = (lang: string): string[] => lang === 'de' ? germanDescription : englishDescription;

export function DocumentMergerDescription(): ReactElement {

  const {i18n} = useTranslation('common');

  return (
    <div className="my-4 p-2 rounded border border-slate-500">
      {getDescription(i18n.language).map((line) => <p key={line}>{line}</p>)}
    </div>
  );
}