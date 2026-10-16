import { modelMetadata } from '@/lib/models'

import { CubeOfSpaceClient } from './CubeOfSpaceClient'

export const metadata = modelMetadata('cube-of-space')

export default function CubeOfSpace() {
  return <CubeOfSpaceClient />
}
