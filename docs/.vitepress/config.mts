import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kryvea Documentation",
  description: "The reporting platform you never expected",

  // GitHub Pages deployment
  base: "/kryvea/",
  head: [["link", { rel: "icon", href: "/kryvea/images/logo.svg" }]],

  // Performance optimizations
  cleanUrls: true,

  // Theme configuration
  themeConfig: {
    logo: "/images/logo.svg",
    siteTitle: "Kryvea Docs",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/installation" },
      { text: "GitHub", link: "https://github.com/alexius22/kryvea" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Installation", link: "/installation" },
          { text: "Configuration", link: "/configuration" },
        ],
      },
      {
        text: "Usage",
        collapsed: false,
        items: [
          { text: "Usage Guide", link: "/usage" },
          { text: "Templating", link: "/templating" },
        ],
      },
      {
        text: "Development",
        collapsed: false,
        items: [{ text: "Contributing", link: "/contributing" }],
      },
      {
        text: "Support",
        collapsed: false,
        items: [{ text: "Troubleshooting", link: "/troubleshooting" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alexius22/kryvea" },
    ],

    footer: {
      message: "Made with ❤ for the security community",
    },

    search: {
      provider: "local",
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: false,
  },
});
