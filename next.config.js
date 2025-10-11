/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // CSP Header - Update this to match your requirements
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "img-src 'self' data: https: http:;",
              "font-src 'self' https://fonts.gstatic.com data:;",
              "connect-src 'self' https://api.paystack.co https://checkout.paystack.com https://www.google-analytics.com https://*.google-analytics.com;",
              "frame-src 'self' https://checkout.paystack.com https://goldentulip.zapier.app https://interfaces.zapier.com;",
              "media-src 'self' data:;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self' https://checkout.paystack.com;",
              "frame-ancestors 'self' https://checkout.paystack.com https://goldentulip.zapier.app https://interfaces.zapier.com;",
            ].join(' '),
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable server-side rendering for all pages
  ssr: true,
  // Enable static site generation
  target: 'server',
  // Enable webpack 5
  future: {
    webpack5: true,
  },
  // Environment variables
  env: {
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
