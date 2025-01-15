import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
import { gradientBgPinkRed } from "../colors";
import SectionMain from "../components/Section/Main";
import { appTitle } from "../config";
import LayoutGuest from "../layouts/Guest";
import CardBox from "../components/CardBox";

const StyleSelectPage = () => {
  const styles = ["white", "basic"];

  const router = useRouter();

  const handleStylePick = (e: React.MouseEvent, style: string) => {
    e.preventDefault();

    document.documentElement.classList.forEach(token => {
      if (token.indexOf("style") === 0) {
        document.documentElement.classList.replace(token, `style-${style}`);
      }
    });

    router.push("/dashboard");
  };

  return (
    <>
      <Head>
        <title>{appTitle}</title>
      </Head>
      <div className={`flex min-h-screen items-center justify-center ${gradientBgPinkRed}`}>
        <SectionMain>
          <CardBox>TODO</CardBox>
        </SectionMain>
      </div>
    </>
  );
};

StyleSelectPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGuest>{page}</LayoutGuest>;
};

export default StyleSelectPage;
