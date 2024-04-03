/*
 * Akk (Akkadian)
 * Sum (Sumerian)
 * Luw (Luwian)
 * Pal (Palaic)
 * Hur (Hurrian)
 * Hat (Hattic)
 * Hit (Hittite)
 * Ign (Ignota/unknown language)
 */

export function footNoteTypes(): string[] {
  return [
    '<Akk',
    '<Sum',
    '<Luw',
    '<Pal',
    '<Hur',
    '<Hat',
    '<Hit',
    '<Ign',
  ];
}

export function convertToAbbreviation(footNote: string): string | undefined {
  return {
    'Akk': 'Akkadian',
    'Sum': 'Sumerian',
    'Luw': 'Luwian',
    'Pal': 'Palaic',
    'Hur': 'Hurrian',
    'Hat': 'Hattic',
    'Hit': 'Hittite',
    'Ign': 'Ignota/unknown language',
  }[footNote];
}