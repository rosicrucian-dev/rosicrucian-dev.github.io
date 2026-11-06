// The icons the models' headers and panels share, from Heroicons (MIT),
// 20px solid unless noted. Each takes the colour of the text around it.

const ICON = {
  fill: 'currentColor',
  'aria-hidden': true,
} as const

// Pointing up; turned by `rotate`, in degrees clockwise.
export function ChevronIcon({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      {...ICON}
      className="size-5"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {/* chevron-up */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
      />
    </svg>
  )
}

export function CogIcon() {
  return (
    <svg viewBox="0 0 20 20" {...ICON} className="size-5">
      {/* cog-6-tooth */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      />
    </svg>
  )
}

// 16px solid.
export function XMarkIcon() {
  return (
    <svg viewBox="0 0 16 16" {...ICON} className="size-4">
      {/* x-mark */}
      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
    </svg>
  )
}

// For putting the view back as it first was.
export function ResetIcon() {
  return (
    <svg viewBox="0 0 20 20" {...ICON} className="size-5">
      {/* arrow-path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
      />
    </svg>
  )
}

// A standing figure (drawn for the site, not from Heroicons).
export function FigureIcon() {
  return (
    <svg viewBox="0 0 20 20" {...ICON} className="size-5">
      <circle cx="10" cy="3.25" r="2.25" />
      <path d="M6.75 6.5h6.5a1.5 1.5 0 0 1 1.5 1.5v4.25a.75.75 0 0 1-1.5 0V9h-.5v9.25a.75.75 0 0 1-1.5 0V13h-.5v5.25a.75.75 0 0 1-1.5 0V9h-.5v3.25a.75.75 0 0 1-1.5 0V8a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  )
}

// A compass: a ring with a needle across it (drawn for the site).
export function CompassIcon() {
  return (
    <svg viewBox="0 0 20 20" {...ICON} className="size-5">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z"
      />
      <path d="m13.6 6.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" />
    </svg>
  )
}
