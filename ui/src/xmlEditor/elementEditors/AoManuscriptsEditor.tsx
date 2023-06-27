import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {DeleteButton} from '../../genericElements/Buttons';
import {XmlCommentNode, XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';
import {Spec} from 'immutability-helper';
import {ReactElement} from 'react';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {useTranslation} from 'react-i18next';
import {aoDirectJoin, convertNodeFormat, usesOldFormat} from './aoTextIdentifierConversion';
import {AoTextIdentifierField} from './AoTextIdentifierField';
import {AoJoinEditor} from './AoJoinEditor';
import {processElement} from '../xmlModelHelpers';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';
export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

export type TextIdentifierNode = XmlElementNode<SourceType, 'nr' | 'joinGroup'>;

export type AoJoinTypes = 'AO:DirectJoin' | 'AO:InDirectJoin';

export type AoJoinNode = XmlElementNode<AoJoinTypes>;

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
  updatePlus: (newValue: string) => void;
  updateText: (newValue: string) => void;
  updateNode: (spec: Spec<XmlNode>) => void;
}

const EditSingleChild = ({child, updatePlus, updateText, updateNode}: EditSingleChildProps): ReactElement => processElement(child,
  () => <></>,
  ({textContent}) => (
    <input className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={textContent}
           onChange={(event) => updatePlus(event.currentTarget.value)}/>
  ),
  (child) => child.tagName === 'AO:DirectJoin' || child.tagName === 'AO:InDirectJoin'
    ? <AoJoinEditor node={child as AoJoinNode} updateType={(newType) => updateNode({tagName: {$set: newType}})}/> : (
      <AoTextIdentifierField source={child} updateType={(value) => updateNode({tagName: {$set: value}})} updateText={(value) => updateText(value)}/>
    )
);

function AoManuscriptsEditor({node, updateEditedNode}: XmlEditableNodeIProps): ReactElement {

  const {t} = useTranslation('common');

  const isInOldFormat = usesOldFormat(node.children);

  const updateChildNode = (index: number, spec: Spec<XmlNode>): void => updateEditedNode({children: {[index]: spec}});

  const updateText = (index: number, newText: string): void => updateChildNode(index, {children: {0: {textContent: {$set: newText}}}});
  const updatePlus = (index: number, newText: string): void => updateChildNode(index, {textContent: {$set: newText}});

  const addEntry = (): void => updateEditedNode({children: {$push: newEntry}});
  const deleteEntry = (index: number): void => updateEditedNode({children: {$splice: [[index, 1]]}});

  // old format

  const convertToNewFormat = (): void => updateEditedNode({children: {$set: node.children.flatMap<NewAoManuscriptsChildNode>(convertNodeFormat)}});

  return (
    <div>
      {node.children.map((source, index) =>
        <div className="my-2 flex" key={index}>
          {/* FIXME: change key to reflect conversion to new format... */}
          <EditSingleChild child={source} updatePlus={(newValue) => updatePlus(index, newValue)} updateText={(newValue) => updateText(index, newValue)}
                           updateNode={(spec) => updateChildNode(index, spec)}/>

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