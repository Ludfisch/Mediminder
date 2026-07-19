import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DosiTime – Medikamentenerinnerungen",
    short_name: "DosiTime",
    description: "Dein persönlicher Medikamentenplan mit zuverlässigen Erinnerungen.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f5f8f7",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
