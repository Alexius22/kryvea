import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createContext, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import "../css/main.css";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export const GlobalContext = createContext<any>({});

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const useUserEmail = useState<string>("TestUser@email.com");
  const useUsername = useState<string>("TestUser");
  const useCustomerName = useState<string>("Customer Name");
  const useDarkTheme = useState(false);
  const [darkTheme, setDarkTheme] = useDarkTheme;

  useEffect(() => setDarkTheme(localStorage.getItem("darkMode") === "1" ? true : false), []);
  useEffect(() => {
    localStorage.setItem("darkMode", darkTheme ? "1" : "0");
    document.body.classList[darkTheme ? "add" : "remove"]("dark-scrollbars");
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark", "dark-scrollbars-compat");
  }, [darkTheme]);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || (page => page);

  const title = `Kryvea`;
  const description = "Kryvea - The reporting platform you never expected";

  return (
    <GlobalContext.Provider
      value={{
        useUserEmail,
        useUsername,
        useCustomerName,
        useDarkTheme,
      }}
    >
      {getLayout(
        <>
          <Head>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image:type" content="image/png" />
            <link rel="icon" href="/frontend/favicon.png" />
          </Head>

          <Component {...pageProps} />
        </>
      )}
    </GlobalContext.Provider>
  );
}
