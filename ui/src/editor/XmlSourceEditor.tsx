import ReactCodeMirror from '@uiw/react-codemirror';
import {xml} from '@codemirror/lang-xml';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {XmlElementNode} from './xmlModel/xmlModel';
import {parseNewXml} from './xmlModel/xmlReading';

interface IProps {
  source: string;
  updateNode: (node: XmlElementNode) => void;
}

export function XmlSourceEditor({source, updateNode}: IProps): JSX.Element {

  const [value, setValue] = useState(source);
  const {t} = useTranslation('common');

  function onSubmit(): void {
    const newRootNode = parseNewXml(value);

    updateNode(newRootNode as XmlElementNode);
  }

  return (
    <>
      <ReactCodeMirror value={source} extensions={[xml()]} onChange={(newValue) => setValue(newValue)} maxHeight="900px"/>

      <div className="my-3">
        <button type="button" className="button is-primary is-fullwidth" onClick={onSubmit}>
          {t('updateXml')}
        </button>
      </div>
    </>
  );
}