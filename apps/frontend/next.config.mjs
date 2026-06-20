/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@retekapp/ui"],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    return [{ source: "/api-backend/:path*", destination: `${api}/api/:path*` }];
  },
};

export default nextConfig;
