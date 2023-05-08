import {inputClasses, XmlEditableNodeIProps} from '../editorConfig';
import {XmlElementNode} from 'simple_xml';
import {useTranslation} from 'react-i18next';
import {JSX} from 'react';

export function SpacesEditor({node, updateEditedNode}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  const updateSpaceCount = (count: string): void => updateEditedNode({children: {[0]: {attributes: {c: {$set: count}}}}});

  return (
    <div>
      <label htmlFor="spacesCount" className="font-bold">{t('spacesCount')}:</label>
      <input type="number" id="spacesCount" defaultValue={(node.children[0] as XmlElementNode).attributes.c} className={inputClasses}
             onChange={(event) => updateSpaceCount(event.target.value)}/>
    </div>
  );
}