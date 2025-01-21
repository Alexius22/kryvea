import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import FormField from "../components/Form/Field";
import { Field, Form, Formik } from "formik";
import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    document.title = getPageTitle("Dashboard");
  }, []);

  return (
    <>
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
        <Formik
          initialValues={{
            search: "",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form className="mb-2">
            <FormField isBorderless isTransparent noHeight>
              <Field name="search" placeholder="Search" />
            </FormField>
          </Form>
        </Formik>
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
}

// DashboardPage.getLayout = function getLayout(page: ReactElement) {
//   return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
// };
