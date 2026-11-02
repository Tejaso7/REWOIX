/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'commondatastorage.googleapis.com',
      'rewoix-media.blob.core.windows.net',
    ],
  },
  async rewrites() {
    let backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1';

    // If backendUrl is missing protocol (e.g. Render passed "rewoix-backend"), prepend protocol
    if (backendUrl && !backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
      if (backendUrl.includes('.onrender.com') || backendUrl.includes('.railway.app') || backendUrl.includes('.app')) {
        backendUrl = `https://${backendUrl}`;
      } else if (backendUrl === 'rewoix-backend' || backendUrl.startsWith('rewoix-backend')) {
        backendUrl = `https://${backendUrl}.onrender.com`;
      } else {
        backendUrl = `https://${backendUrl}`;
      }
    }

    // Ensure it ends with /api/v1
    if (backendUrl && !backendUrl.includes('/api/v1')) {
      backendUrl = `${backendUrl.replace(/\/$/, '')}/api/v1`;
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
