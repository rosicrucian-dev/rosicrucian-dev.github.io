// What an icon is, for the gallery (IconGallery) and the server that reads
// them (icons.ts): the categories, the tags, the icon.

export const CATEGORIES = [
  'planets',
  'points',
  'signs',
  'aspects',
  'elements',
  'dignities',
  'numerals',
  'letters',
] as const
export type Category = (typeof CATEGORIES)[number]

export interface IconMeta {
  category: Category
  /** The Unicode character it stands for, if one does. */
  codepoint?: string
  character?: string
  keywords: string[]
  source: 'original' | 'heroicons'
  heroicon?: string
}

export interface Icon extends IconMeta {
  name: string
  /** "NorthNodeIcon": its React and Vue component. */
  component: string
  /** The file, as the package ships it. */
  svg: string
  /** The path's data alone. */
  path: string
}
