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
};

export default nextConfig;