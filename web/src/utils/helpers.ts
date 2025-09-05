import { appTitle } from "./constants";

export const getPageTitle = (currentPageTitle: string) => `${currentPageTitle} — ${appTitle}`;
