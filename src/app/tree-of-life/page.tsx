import { modelMetadata } from '@/lib/models'

import { TreeOfLifeClient } from './TreeOfLifeClient'

export const metadata = modelMetadata('tree-of-life')

export default function TreeOfLife() {
  return <TreeOfLifeClient />
}
