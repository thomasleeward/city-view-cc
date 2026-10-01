import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers(){return [{source:'/proof-preview',headers:[{key:'Content-Security-Policy',value:"frame-ancestors https://login.proofcreatives.com https://proofadmin-kappa.vercel.app"},{key:'Cache-Control',value:'private, no-store'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]}];},
  async redirects() {
    // Shared Clean Links own this route after cutover. Keep the legacy deployment intact.
    if (process.env.PROOFADMIN_ENABLED === "true") return [];
    return [
      {
        source: "/planyourvisit",
        destination:
          "https://app.textinchurch.com/connect-cards/Li7s8Mmvkv9BwoLBawjM",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.leadconnectorhq.com" },
      { protocol: "https", hostname: "assets.cdn.filesafe.space" },
      { protocol: "https", hostname: "cdn.filesafe.space" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
