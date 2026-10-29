import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oslo Elite Hotel & Suites",
    short_name: "Oslo Elite",
    description: "A bespoke, 5-star luxury hotel and suite booking destination in Oslo, Norway.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#000000",
    icons: [
      {
        src: "/osloelitelogo.webp",
        sizes: "any",
        type: "image/webp",
      },
    ],
  };
}
