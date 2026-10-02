/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow Wikimedia Commons video streaming with Range requests
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // Content Security Policy — allows wikimedia video streaming
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https://upload.wikimedia.org https://commons.wikimedia.org",
              "connect-src 'self' https://upload.wikimedia.org https://commons.wikimedia.org",
              "frame-src 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    };
    return config;
  },
};

export default nextConfig;
