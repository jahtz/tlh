import ReactCodeMirror from '@uiw/react-codemirror';
import {xml} from '@codemirror/lang-xml';

interface IProps {
  source: string;
  onChange: (value: string) => void;
}

export function XmlSourceEditor({source, onChange}: IProps): JSX.Element {

  /*
  const [value, setValue] = useState(source);
  const {t} = useTranslation('common');

  function onSubmit(): void {
    const newRootNode = parseNewXml(value);

    updateNode(newRootNode as XmlElementNode);
  }

   */

  return (
    <>


      {/* FIXME: move button!
      <div>
        <button type="button" className="button is-primary is-fullwidth" onClick={onSubmit}>
          {t('updateXml')}
        </button>
      </div>
      */}
    </>
  );
}