import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The database certificate is read at runtime, so Vercel must be told to ship it.
  outputFileTracingIncludes: { "/*": ["./supabase/certs/**/*"] },
  // Pages folded into others: old links and shares land on the section that replaced them.
  // Temporary (307), so browsers don't cache them forever in case a page comes back.
  async redirects() {
    return [
      { source: "/stats", destination: "/table#numbers", permanent: false },
      { source: "/history", destination: "/club#nights", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
