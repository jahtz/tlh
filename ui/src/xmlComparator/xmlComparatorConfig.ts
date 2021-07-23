export interface XmlComparatorConfig {
  name: string;
  replacements: {
    [key: string]: string
  };
}

export const emptyXmlComparatorConfig: XmlComparatorConfig = {
  name: 'empty', replacements: {}
};

export const defaultXmlComparatorConfig: XmlComparatorConfig = {
  name: 'tlhDig',
  replacements: {
    '®': '\n\t',
    '{': '\n\t\t{',
    '+=': '\n\t\t   += ',
    '<w ': '\n<w ',
    '@': ' @ '
  }
};

export const allXmlComparatorConfig: XmlComparatorConfig[] = [
  emptyXmlComparatorConfig, defaultXmlComparatorConfig
];

export function makeReplacements(xmlContent: string, config: XmlComparatorConfig = defaultXmlComparatorConfig): string {
  return Object.entries(config.replacements)
    .reduce<string>((acc, [key, value]) => acc.replaceAll(key, value), xmlContent);
}
