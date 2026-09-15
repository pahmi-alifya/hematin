import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hematin.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Halaman akun/pengaturan/kelola dompet murni fungsional & per-pengguna - tidak ada
      // konten unik untuk crawler anonim, jadi tidak perlu (dan sebaiknya tidak) di-index.
      disallow: ["/login", "/register", "/settings", "/profile", "/wallets"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
