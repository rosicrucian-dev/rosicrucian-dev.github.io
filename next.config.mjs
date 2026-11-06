/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — the whole site is one prerendered page, served
  // straight off GitHub Pages with no Node runtime.
  output: 'export',
  images: { unoptimized: true },
  // Pages serves each route as a directory with an index.html, so the
  // trailing slash keeps relative asset URLs resolving correctly.
  trailingSlash: true,
}

export default nextConfig
