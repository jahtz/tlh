import {CSSProperties} from 'react';

export type InlineStyle = 'Akadogramm' | 'Sumerogramm';

export const inlineStyles: InlineStyle[] = ['Akadogramm', 'Sumerogramm'];

export const styleMap: { [styleName in InlineStyle]: CSSProperties; } = {
  'Akadogramm': {
    color: '#800000',
    fontStyle: 'italic',
  },
  'Sumerogramm': {
    color: '#355e00',
    fontStyle: 'normal',
  }
};