import {alt, Parser, string} from 'parsimmon';
import {xmlElementNode, XmlElementNode} from '../xmlModel/xmlModel';

export type DamageType = XmlElementNode<'del_in'> | XmlElementNode<'del_fin'> | XmlElementNode<'laes_in'> | XmlElementNode<'laes_fin'>;


export const del_in = xmlElementNode('del_in');
export const del_fin = xmlElementNode('del_fin');

export const laes_in = xmlElementNode('laes_in');
export const laes_fin = xmlElementNode('laes_fin');


export const damageParser: Parser<DamageType> = alt(
  string('[').result(del_in),
  string(']').result(del_fin),
  string('⸢').result(laes_in),
  string('⸣').result(laes_fin),
  // FIXME: rasure has start and end!
  // string('*').result(ras_in),
);