import type { Metadata } from 'next'

import { ShemHaMephorashClient } from './ShemHaMephorashClient'

// A project of its own on the home page rather than one of the models: a
// flat figure, not a 3D one. Its metadata is its own for the same reason
// (the models' comes from their registry).
const name = 'Shem HaMephorash'
const description =
  'The 72 Names of the Shem HaMephorash on a wheel, with a pentagram turning inside it: set its Spirit point on a Name and the other four points give that Name’s formula, after Dan Moore’s Pentagram Technique.'

export const metadata: Metadata = {
  title: name,
  description,
  openGraph: { title: name, description, url: '/shem-hamephorash' },
}

export default function ShemHaMephorash() {
  return <ShemHaMephorashClient />
}
