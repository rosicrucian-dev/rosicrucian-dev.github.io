import { modelMetadata } from '@/lib/models'

import { ShemHaMephorashClient } from './ShemHaMephorashClient'

export const metadata = modelMetadata('shem-hamephorash')

export default function ShemHaMephorash() {
  return <ShemHaMephorashClient />
}
