import { modelMetadata } from '@/lib/models'

import { VaultClient } from './VaultClient'

export const metadata = modelMetadata('vault')

export default function Vault() {
  return <VaultClient />
}
