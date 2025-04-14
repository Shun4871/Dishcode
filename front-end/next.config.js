/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // すべての HTTPS ホストを許可
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLintエラーを無視してビルド成功させる
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;