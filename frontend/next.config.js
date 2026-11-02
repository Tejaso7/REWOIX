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
      } else {
        // Internal container/service name within Docker or Render private network
        backendUrl = `http://${backendUrl}:10000`;
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
