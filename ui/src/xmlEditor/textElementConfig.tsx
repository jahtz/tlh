import {XmlSingleEditableNodeConfig} from './editorConfig';
import {displayReplace} from './editorConfig/displayReplacement';
import classNames from 'classnames';
import {selectedNodeClass} from './tlhXmlEditorConfig';
import {LanguageInput} from './LanguageInput';

const langAttrName = 'xml:lang';

export const textElementConfig: XmlSingleEditableNodeConfig = {
  replace: (node, renderChildren, isSelected, isLeftSide) => displayReplace(
    <>
      <span className={classNames('italic', {[selectedNodeClass]: isLeftSide && isSelected})}>[Textsprache: {node.attributes[langAttrName]}]</span>
      {isLeftSide && <br/>}
    </>,
    renderChildren()
  ),
  edit: ({node, updateAttribute}) => <div className="p-2">
    <LanguageInput initialValue={node.attributes[langAttrName]} onChange={(value) => updateAttribute(langAttrName, value)}/>
  </div>
};
