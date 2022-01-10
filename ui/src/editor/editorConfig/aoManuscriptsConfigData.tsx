import {XmlSingleEditableNodeConfig} from './editorConfig';

interface AoManuscriptsData {
  _x: 1;
}

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig<AoManuscriptsData> = {
  edit: (props) => <>
    <span>TODO!</span>
  </>,
  readNode: (node) => ({_x: 1}),
  writeNode: (t, originalNode) => originalNode
};