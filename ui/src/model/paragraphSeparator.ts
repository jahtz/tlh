export interface ParagraphSeparator {
  type: 'ParagraphSeparator';
  double: boolean;
}

export const paragraphSeparator: ParagraphSeparator = {
  type: 'ParagraphSeparator',
  double: false
};

export const paragraphSeparatorDouble: ParagraphSeparator = {
  type: 'ParagraphSeparator',
  double: true
};
