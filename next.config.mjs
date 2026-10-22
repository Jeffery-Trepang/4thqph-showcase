/** @type {import('next').NextConfig} */
const nextConfig = {
  // This showcase build has no backend: it is exported as pure static files.
  output: "export",

  // GitHub Pages project sub-path. `basePath`/`assetPrefix` cover Next.js
  // assets and <Link> routing; NEXT_PUBLIC_BASE_PATH is used explicitly by raw
  // <img> tags, which Next.js does not rewrite automatically.
  basePath: "/4thqph-showcase",
  assetPrefix: "/4thqph-showcase/",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/4thqph-showcase",
  },
  images: { unoptimized: true },

  eslint: {
    // Do not run ESLint during `next build` (not part of this deliverable).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
