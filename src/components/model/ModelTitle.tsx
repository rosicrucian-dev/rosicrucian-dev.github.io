import Image from 'next/image'
import Link from 'next/link'

// The title in a model's header: the site's emblem, which leads back to
// the list of models, and the model's name beside it.
export function ModelTitle({ children }: { children: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href="/models"
        aria-label="Back to all models"
        title="All models"
        className="relative -m-1 shrink-0 rounded-lg p-1 transition hover:bg-current/10"
      >
        <span className="absolute -inset-1.5 pointer-fine:hidden" />
        <Image
          src="/avatar.png"
          alt=""
          width={28}
          height={28}
          className="size-7"
        />
      </Link>
      <h1 className="truncate text-sm/6 font-semibold">{children}</h1>
    </div>
  )
}
