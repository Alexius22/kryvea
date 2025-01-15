import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import Head from "next/head";
import type { ReactElement } from "react";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/Authenticated";

const DashboardPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Dashboard")}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiDotsCircle} title="Activity in progress" />
        <CardBox hasTable>
          <Table
            data={[
              {
                Customer: 1,
                "Assessment Name": 2,
                "Assessment Type": 3,
                "Vulnerability Count": 4,
                Start: 5,
                End: 6,
                Status: 7,
              },
            ]}
            perPageCustom={10}
          />
        </CardBox>
      </SectionMain>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiHistory} title="Activities history" />
        <CardBox hasTable>
          <Table
            data={[
              {
                Customer: 1,
                "Assessment Name": 2,
                "Assessment Type": 3,
                "Vulnerability Count": 4,
                Start: 5,
                End: 6,
                Status: 7,
              },
            ]}
            perPageCustom={10}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default DashboardPage;
