/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGithubPages ? "/my-timer" : undefined,
  assetPrefix: isGithubPages ? "/my-timer/" : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/my-timer" : "",
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
