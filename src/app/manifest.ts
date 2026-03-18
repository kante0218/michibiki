import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "みちびき 導",
    short_name: "みちびき",
    description: "AIが見つける、最適な仕事と人材",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/logo-icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
