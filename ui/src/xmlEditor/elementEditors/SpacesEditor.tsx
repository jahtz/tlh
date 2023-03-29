import {XmlEditableNodeIProps} from '../editorConfig';
import {XmlElementNode} from 'simple_xml';
import {useTranslation} from 'react-i18next';

export function SpacesEditor({data, updateEditedNode}: XmlEditableNodeIProps<XmlElementNode<'w'>>): JSX.Element {

  const {t} = useTranslation('common');

  function updateSpaceCount(count: string): void {
    updateEditedNode({children: {[0]: {attributes: {c: {$set: count}}}}});
  }

  return (
    <div>
      <label htmlFor="spacesCount" className="font-bold">{t('spacesCount')}:</label>
      <input type="number" id="spacesCount" defaultValue={(data.children[0] as XmlElementNode).attributes.c}
             className="p-2 rounded border border-slate-500 mt-2 w-full" onChange={(event) => updateSpaceCount(event.target.value)}/>
    </div>
  );
}