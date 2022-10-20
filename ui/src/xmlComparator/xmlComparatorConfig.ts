export interface XmlComparatorConfig {
  name: string;
  replacements: [RegExp, string][];
}

export const emptyXmlComparatorConfig: XmlComparatorConfig = {
  name: 'empty', replacements: []
};

export const defaultXmlComparatorConfig: XmlComparatorConfig = {
  name: 'tlhDig',
  replacements: [
    [/®/g, '\n\t'],
    [/{/g, '\n\t\t{'],
    [/\+=/g, '\n\t\t   += '],
    [/<w /g, '\n<w '],
    [/@/g, ' @ ']
  ]
};

export const allXmlComparatorConfig: XmlComparatorConfig[] = [
  emptyXmlComparatorConfig, defaultXmlComparatorConfig
];

export function makeReplacements(xmlContent: string, config: XmlComparatorConfig = defaultXmlComparatorConfig): string {
  return config.replacements.reduce<string>(
    (acc, [key, value]) => {
      const regexp = new RegExp(key, 'g');
      return acc.replace(regexp, value);
    },
    xmlContent
  );
}
