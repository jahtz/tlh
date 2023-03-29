import {XmlEditableNodeIProps} from '../editorConfig';
import {AoSource, readSource, SourceType, sourceTypes} from './aoManuscriptsConfigData';
import {DeleteButton} from '../../genericElements/Buttons';
import {isXmlElementNode, isXmlTextNode, XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';

interface AoTextNumberFieldProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

function AoTextNumberField({source: {type, name}, updateType, updateText}: AoTextNumberFieldProps): JSX.Element {
  return (
    <>
      <select defaultValue={type} className="p-2 rounded-l border-l border-y border-slate-500 bg-gray-100"
              onChange={(event) => updateType(event.target.value as SourceType)}>
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name} onChange={(event) => updateText(event.target.value)}/>
    </>
  );
}

const newEntry: XmlNode[] = [
  xmlTextNode('+'),
  xmlElementNode('AO:TxtPubl', {}, [xmlTextNode('')])
];

export function AoManuscriptsEditor({data, updateEditedNode}: XmlEditableNodeIProps<XmlElementNode<'AO:Manuscripts'>>): JSX.Element {

  const content: (AoSource | string)[] = data.children.map((n) => {
    if (isXmlElementNode(n)) {
      return readSource(n);
    } else if (isXmlTextNode(n)) {
      return n.textContent.trim();
    } else {
      return `<!-- ${n.comment} -->`;
    }
  });

  const updateType = (index: number, newType: SourceType): void => updateEditedNode({children: {[index]: {tagName: {$set: newType}}}});

  const updateText = (index: number, newText: string): void => updateEditedNode({children: {[index]: {children: {0: {textContent: {$set: newText}}}}}});

  const updatePlus = (index: number, newText: string): void => updateEditedNode({children: {[index]: {textContent: {$set: newText}}}});

  const addEntry = (): void => updateEditedNode({children: {$push: newEntry}});

  const deleteEntry = (index: number): void => updateEditedNode({children: {$splice: [[index, 1]]}});

  return (
    <div>
      {content.map((source, index) =>
        <div className="mt-2 flex" key={index}>
          {typeof source === 'string'
            ? <input key={index} className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={source}
                     onChange={(event) => updatePlus(index, event.currentTarget.value)}/>
            : <AoTextNumberField key={index} source={source} updateType={(value) => updateType(index, value)}
                                 updateText={(value) => updateText(index, value)}/>}

          <DeleteButton onClick={() => deleteEntry(index)} otherClasses={['px-4', 'py-2', 'rounded-r']}/>
        </div>
      )}

      <button type="button" className="mt-2 p-2 rounded border bg-blue-600 text-white text-center w-full" onClick={addEntry}>+</button>
    </div>
  );
}