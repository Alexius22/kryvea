import type { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ThemeImage from "./components/ThemeImage.vue";

export default {
  ...DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component("ThemeImage", ThemeImage);
  },
};
