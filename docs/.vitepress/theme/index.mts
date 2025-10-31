import type { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ThemeImage from "./components/ThemeImage.vue";
import Layout from "./Layout.vue";

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component("ThemeImage", ThemeImage);
  },
};
