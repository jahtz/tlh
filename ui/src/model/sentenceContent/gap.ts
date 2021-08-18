export interface AOGap {
  type: 'gap';
  c: string;
  t?: string;
}

export function aoGap(c: string, t?: string): AOGap {
  return {type: 'gap', c, t};
}
