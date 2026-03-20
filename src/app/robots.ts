import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/home", "/profile", "/dashboard", "/referrals", "/earnings", "/payment", "/interview/practice", "/interview/live"],
      },
    ],
    sitemap: "https://michibiki.tech/sitemap.xml",
  };
}
