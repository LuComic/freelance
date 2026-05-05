const PUBLIC_DYNAMIC_ROUTES = [
  "/legal",
  "/legal/cookies",
  "/legal/privacy",
  "/legal/terms",
  "/tutorial",
];

module.exports = {
  siteUrl: "https://www.pageboard.app",
  generateRobotsTxt: true,
  changefreq: "weekly",
  sitemapSize: 7000,
  exclude: ["/notifications", "/projects", "/projects/*", "/settings"],
  additionalPaths: async () =>
    PUBLIC_DYNAMIC_ROUTES.map((route) => ({
      loc: route,
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date().toISOString(),
    })),
};
