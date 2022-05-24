import { XmlEditableNodeIProps, XmlSingleEditableNodeConfig } from "../editorConfig/editorConfig";
import { useTranslation } from "react-i18next";
import { NodeEditorRightSide } from "../NodeEditorRightSide";

export const clEditorConfig: XmlSingleEditableNodeConfig = {
  replace: (node, renderedChildren, isSelected, isLeftSide) => (
    <div>
      <span className="cl">{node.attributes.id}</span>&nbsp;{isLeftSide && renderedChildren}
    </div>
  ),
  edit: (props) => <ClEditor {...props} />,
  readNode: (n) => n,
  writeNode: (n) => n,
};

export function ClEditor({
  data,
  originalNode,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateSubmit,
  initiateJumpElement,
  fontSizeSelectorProps,
  cancelSelection,
}: XmlEditableNodeIProps): JSX.Element {
  const { t } = useTranslation("common");

  return (
    <NodeEditorRightSide
      originalNode={originalNode}
      changed={changed}
      initiateSubmit={initiateSubmit}
      jumpElement={initiateJumpElement}
      deleteNode={deleteNode}
      fontSizeSelectorProps={fontSizeSelectorProps}
      cancelSelection={cancelSelection}
    >
      <></>
    </NodeEditorRightSide>
  );
}
