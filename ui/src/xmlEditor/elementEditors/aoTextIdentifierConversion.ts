import {isXmlElementNode, isXmlTextNode, xmlElementNode, XmlNode, xmlTextNode, XmlTextNode} from 'simple_xml';
import {NewAoManuscriptsChildNode} from './AoManuscriptsEditor';
import {AoJoinNode} from './AoJoinEditor';
import {SourceType} from './AoTextIdentifierField';

const oldFragmentFormatRegExp = /{(€\d+)}/;

export const aoDirectJoin: AoJoinNode = xmlElementNode('AO:DirectJoin');
export const aoInDirectJoin: AoJoinNode = xmlElementNode('AO:InDirectJoin');

export const usesOldFormat = (childNodes: XmlNode[]): boolean => childNodes.some((node) => {
  if (isXmlElementNode(node)) {
    if (node.tagName === 'AO:DirectJoin' || node.tagName === 'AO:InDirectJoin') {
      return false;
    }

    // test if text contains {€\d+}?
    const {textContent} = node.children[0] as XmlTextNode;

    return textContent.search(oldFragmentFormatRegExp) !== -1;
  } else {
    // should be <AO:DirectJoin/> or <AO:InDirectJoin/>
    return !!isXmlTextNode(node);
  }
});

const extractFragmentIdentifier = (singleFragmentString: string, regExpResult: RegExpExecArray): { textContent: string, nr: string } => {
  const startPosition = regExpResult.index;

  const prior = singleFragmentString.substring(0, startPosition);
  const posterior = singleFragmentString.substring(startPosition + regExpResult[1].length + 2);

  return {textContent: (prior + posterior).trim(), nr: regExpResult[1]};
};

export const convertSingleFragment = (tagName: SourceType, singleFragmentString: string): NewAoManuscriptsChildNode => {
  const maybeFragmentIdentifier = oldFragmentFormatRegExp.exec(singleFragmentString);

  const {textContent, nr} = maybeFragmentIdentifier !== null
    ? extractFragmentIdentifier(singleFragmentString, maybeFragmentIdentifier)
    : {textContent: singleFragmentString, nr: undefined};

  return xmlElementNode(tagName, {nr}, [xmlTextNode(textContent)]);
};

export const convertNodeFormat = (node: XmlNode): NewAoManuscriptsChildNode[] => {
  if (isXmlElementNode(node)) {
    const {textContent} = node.children[0] as XmlTextNode;

    const childStrings = textContent
      .split('(+)');

    const [firstGroup, ...otherGroups] = childStrings
      .map((childString) => {
        const [firstNew, ...otherNew] = childString
          .trim()
          // split for direct joins
          .split('+')
          .map(
            (singleFragmentString) => convertSingleFragment(node.tagName as SourceType, singleFragmentString)
          );


        return [firstNew, ...otherNew.flatMap((n) => [aoDirectJoin, n])];
      });

    const result = firstGroup;
    for (const otherGroup of otherGroups) {
      result.push(aoInDirectJoin, ...otherGroup);
    }
    return result;
  } else if (isXmlTextNode(node)) {
    return node.textContent.trim() === '(+)'
      ? [xmlElementNode('AO:InDirectJoin')]
      : [xmlElementNode('AO:DirectJoin')];
  } else {
    return [node];
  }
};
