import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {DeleteButton} from '../../genericElements/Buttons';
import {XmlCommentNode, XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';
import {Spec} from 'immutability-helper';
import {ReactElement, useState} from 'react';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {useTranslation} from 'react-i18next';
import {aoDirectJoin, convertNodeFormat, usesOldFormat} from './aoTextIdentifierConversion';
import {AoTextIdentifierField, TextIdentifierNode} from './AoTextIdentifierField';
import {AoJoinEditor, AoJoinNode, isAoJoinNode} from './AoJoinEditor';
import {processElement} from '../xmlModelHelpers';

export type NewAoManuscriptsChildNode = TextIdentifierNode | AoJoinNode | XmlCommentNode;

const newEntry: XmlNode[] = [
  aoDirectJoin,
  xmlElementNode('AO:TxtPubl', {nr: undefined}, [xmlTextNode('')])
];

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig = {
  replace: (node, renderChildren, isSelected) => <span className={classNames({[selectedNodeClass]: isSelected, 'bg-amber-500': usesOldFormat(node.children)})}>
    {renderChildren()}
  </span>,
  edit: (props) => <AoManuscriptsEditor {...props}/>
};

interface EditSingleChildProps {
  child: XmlNode;
  updateNode: (spec: Spec<XmlNode>) => void;
}

const EditSingleChild = ({child, updateNode}: EditSingleChildProps): ReactElement => processElement(child,
  () => <></>,
  ({textContent}) => (
    <input className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={textContent}
           onChange={(event) => updateNode({textContent: {$set: event.currentTarget.value}})}/>
  ),
  (child) => isAoJoinNode(child)
    ? <AoJoinEditor node={child} updateType={(newType) => updateNode({tagName: {$set: newType}})}/>
    : <AoTextIdentifierField source={child as TextIdentifierNode} updateNode={updateNode as (spec: Spec<XmlElementNode>) => void}/>
);

function AoManuscriptsEditor({node, updateEditedNode}: XmlEditableNodeIProps): ReactElement {

  const {t} = useTranslation('common');
  const [converted, setConverted] = useState(0);

  const isInOldFormat = usesOldFormat(node.children);

  const updateChildNode = (index: number, spec: Spec<XmlNode>): void => updateEditedNode({children: {[index]: spec}});

  const addEntry = (): void => updateEditedNode({children: {$push: newEntry}});
  const deleteEntry = (index: number): void => updateEditedNode({children: {$splice: [[index, 1]]}});

  // old format

  const convertToNewFormat = (): void => {
    setConverted(1);
    updateEditedNode({children: {$set: node.children.flatMap<NewAoManuscriptsChildNode>(convertNodeFormat)}});
  };

  return (
    <div>
      {node.children.map((source, index) =>
        <div className="my-2 flex" key={(converted * 100) + index}>
          <EditSingleChild child={source} updateNode={(spec) => updateChildNode(index, spec)}/>

          <DeleteButton onClick={() => deleteEntry(index)} otherClasses={['px-4', 'py-2', 'rounded-r']}/>
        </div>
      )}

      {isInOldFormat && <button type="button" className="my-2 p-2 rounded bg bg-amber-500 text-center w-full" onClick={convertToNewFormat}>
        {t('convertToNewFormat')}
      </button>}

      <button type="button" className="my-2 p-2 rounded border bg-blue-600 text-white text-center w-full" onClick={addEntry}>+</button>
    </div>
  );
}