import {XmlSingleEditableNodeConfig} from './editorConfig';
import {displayReplace} from './editorConfig/displayReplacement';

/**
 * @deprecated
 */
export const textElementConfig: XmlSingleEditableNodeConfig = {
  replace: (node, renderChildren) => displayReplace(<div>XYZ</div>, renderChildren()),
  edit: ({node}) => {
    console.info(node.attributes['xml:lang']);
    return <div>TODO!</div>;
  }
};