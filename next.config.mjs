/** @type {import('next').NextConfig} */
const nextConfig = {
  // This showcase build has no backend: it is exported as pure static files.
  output: "export",

  basePath:'/4thqph-showcase',
  assetPrefix:'/4thqph-showcase',
  images: { unoptimized: true},
  
  eslint: {
    // Do not run ESLint during `next build` (not part of this deliverable).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
