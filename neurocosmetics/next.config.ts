import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Режим отладки: ссылка в футере и /debug доступны в dev
    NEXT_PUBLIC_DEBUG_MODE:
      process.env.NODE_ENV === "development"
        ? "true"
        : process.env.NEXT_PUBLIC_DEBUG_MODE,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
