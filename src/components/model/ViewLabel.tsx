import clsx from 'clsx'
import type { ReactNode } from 'react'

import { panel } from './ModelShell'

// The label in the scene's lower left saying what the viewer faces or
// where they stand: a dot of its colour, its name, and a few details after
// it. Read out by screen readers as it changes.
export function ViewLabel({
  swatch,
  title,
  details = [],
}: {
  swatch?: string
  title: ReactNode
  details?: ReactNode[]
}) {
  return (
    <p
      aria-live="polite"
      className={clsx(
        panel,
        'absolute bottom-4 left-4 px-3 py-1.5 text-xs/5 sm:bottom-6 sm:left-6 lg:left-8',
      )}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {swatch && (
        <span
          className="mr-2 inline-block size-2.5 rounded-full align-middle"
          style={{ background: swatch }}
        />
      )}
      <span className="font-medium text-white">{title}</span>
      {details.map((detail, i) => (
        <span key={i} className="text-olive-400">
          {' '}
          · {detail}
        </span>
      ))}
    </p>
  )
}
