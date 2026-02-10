import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  ...(isStaticExport && {
    output: "export" as const,
    basePath: process.env.BASE_PATH || "",
    images: { unoptimized: true },
  }),
};

export default withSerwist(nextConfig);
