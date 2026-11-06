import { modelMetadata } from '@/lib/models'

import { TreeOfLifeSphereClient } from './TreeOfLifeSphereClient'

export const metadata = modelMetadata('tree-of-life-sphere')

export default function TreeOfLifeSphere() {
  return <TreeOfLifeSphereClient />
}
