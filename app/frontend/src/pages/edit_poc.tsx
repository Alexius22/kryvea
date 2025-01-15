import { mdiFileEdit, mdiPlus } from "@mdi/js";
import Head from "next/head";
import type { ReactElement } from "react";
import Button from "../components/Button";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/Authenticated";
import Buttons from "../components/Buttons";

const EditPocPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Add PoC")}</title>
      </Head>

      <SectionMain>
        <CardBox className="flex mb-6" hasTable>
          <table className="table-fixed">
            <thead>
              <tr>
                <th>Edit PoC</th>
              </tr>
            </thead>
            <tr>
              <td className="before:hidden lg:w-1 whitespace-nowrap">
                <Buttons type="text-center" noWrap>
                  <Button label="Request/Response" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                  <Button label="Image" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                  <Button label="Text" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                </Buttons>
              </td>
            </tr>
          </table>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditPocPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default EditPocPage;
