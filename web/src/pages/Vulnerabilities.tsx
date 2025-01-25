import { mdiTabSearch } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import CardBox from "../components/CardBox";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";

const Vulnerabilities = () => {
  useEffect(() => {
    document.title = getPageTitle("Vulnerabilities");
  }, []);
  return (
    <>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiTabSearch} title="Vulnerabilities" />
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
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Vulnerability: i + 1,
                "CVSS score": i + 1,
                "CVSS Vector": i + 1,
                Customer: i + 1,
                Host: i + 1,
              }))}
            buttons={undefined}
            perPageCustom={10}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Vulnerabilities;
