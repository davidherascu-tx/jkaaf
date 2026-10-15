import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy for the public site and dashboards (the Sanity Studio at /studio is excluded below,
// because it loads many third-party resources of its own).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
  "frame-src 'self' https://cdn.sanity.io",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      { source: "/((?!studio).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
      // Pages with accounts, orders or admin tools must never be cached by browsers or proxies.
      { source: "/(account|admin|shop/orders|shop/checkout)/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
