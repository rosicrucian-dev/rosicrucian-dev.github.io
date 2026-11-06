import Image from 'next/image'
import Link from 'next/link'

// The title in a model's header: the site's emblem, which leads back to
// the list of models (or, for a page that isn't one, wherever `back`
// says), and the model's name beside it.
export function ModelTitle({
  children,
  back = { href: '/models', label: 'All models' },
}: {
  children: string
  back?: { href: string; label: string }
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={back.href}
        aria-label={`Back to ${back.label.toLowerCase()}`}
        title={back.label}
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
