import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {DeleteButton} from '../../genericElements/Buttons';
import {isXmlElementNode, isXmlTextNode, XmlCommentNode, XmlElementNode, xmlElementNode, XmlNode, XmlTextNode, xmlTextNode} from 'simple_xml';
import {Spec} from 'immutability-helper';
import {JSX} from 'react';
import {AoTextIdentifierField} from './AoTextIdentifierField';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {useTranslation} from 'react-i18next';
import {convertNodeFormat, usesOldFormat} from './aoTextIdentifierConversion';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';
export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

export type TextIdentifierNode = XmlElementNode<SourceType, 'nr' | 'joinGroup'>;

type AoJoinTypes = 'AO:DirectJoin' | 'AO:InDirectJoin';
const joinTypes: AoJoinTypes[] = ['AO:DirectJoin', 'AO:InDirectJoin'];

export type AoJoinNode = XmlElementNode<AoJoinTypes>;

export type NewAoManuscriptsChildNode = TextIdentifierNode | AoJoinNode | XmlCommentNode;

/** @deprecated */
export interface AoSource {
  type: SourceType;
  name: string;
}

function readSource(node: XmlElementNode): AoSource {
  if (node.tagName === 'AO:TxtPubl' || node.tagName === 'AO:InvNr') {
    return {type: node.tagName, name: (node.children[0] as XmlTextNode).textContent};
  } else {
    throw new Error(`Could not read Source with tagName ${node.tagName}`);
  }
}

const newEntry: XmlNode[] = [
  xmlTextNode('+'),
  xmlElementNode('AO:TxtPubl', {}, [xmlTextNode('')])
];

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig = {
  replace: (node, renderChildren, isSelected) => <span className={classNames({[selectedNodeClass]: isSelected, 'bg-amber-500': usesOldFormat(node.children)})}>
    {renderChildren()}
  </span>,
  edit: (props) => <AoManuscriptsEditor {...props}/>
};

function readContent(childNodes: XmlNode[]): (AoSource | string)[] {
  return childNodes.map((n) => {
    if (isXmlElementNode(n)) {
      return readSource(n);
    } else if (isXmlTextNode(n)) {
      return n.textContent.trim();
    } else {
      return `<!-- ${n.comment} -->`;
    }
  });
}

function AoManuscriptsEditor({node, updateEditedNode}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  const content: (AoSource | string)[] = readContent(node.children);

  const updateChildNode = (index: number, spec: Spec<XmlNode>): void => updateEditedNode({children: {[index]: spec}});

  const updateText = (index: number, newText: string): void => updateChildNode(index, {children: {0: {textContent: {$set: newText}}}});
  const updatePlus = (index: number, newText: string): void => updateChildNode(index, {textContent: {$set: newText}});

  const addEntry = (): void => updateEditedNode({children: {$push: newEntry}});
  const deleteEntry = (index: number): void => updateEditedNode({children: {$splice: [[index, 1]]}});

  // old format

  const isInOldFormat = usesOldFormat(node.children);

  const convertToNewFormat = (): void => {
    const newChildren = node.children.flatMap<NewAoManuscriptsChildNode>(convertNodeFormat);

    for (const newChild of newChildren) {
      console.info(JSON.stringify(newChild));
    }

    // updateEditedNode({children: {$set: newChildren}});
  };

  return (
    <div>
      {content.map((source, index) =>
        <div className="my-2 flex" key={index}>
          {typeof source === 'string'
            ? <input key={index} className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={source}
                     onChange={(event) => updatePlus(index, event.currentTarget.value)}/>
            : <AoTextIdentifierField key={index} source={source} updateType={(value) => updateChildNode(index, {tagName: {$set: value}})}
                                     updateText={(value) => updateText(index, value)}/>}

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