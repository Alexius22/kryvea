import { Field, Formik } from "formik";
import { useEffect, useState } from "react";
import CardBox from "../components/CardBox";
import Accordion from "../components/Form/Accordion";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import { vulnerabilities } from "../mockup_data/vulnerabilities";
import CVSS31Wrapper from "../components/CVSS/CVSS31Wrapper/CVSS31Wrapper";
import CVSS40Wrapper from "../components/CVSS/CVSS40Wrapper/CVSS40Wrapper";
import { mdiCalculator } from "@mdi/js";
import Button from "../components/Button";
import ScoreBar from "../components/CVSS/ScoreBar";
import { Form } from "react-router";
import CardBoxModal from "../components/CardBox/Modal";

const LiveEditor = () => {
  const [isCvss4, setIsCvss4] = useState(false);
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const handleModalAction = () => {
    setIsModalInfoActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Live Editor");
  }, []);

  return (
    <>
      <CardBoxModal
        title="Recalculate CVSS"
        buttonColor="info"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
        className={"xl:w-8/12"}
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          {isCvss4 ? <CVSS40Wrapper /> : <CVSS31Wrapper />}
        </Formik>
      </CardBoxModal>
      <SectionMain>
        <CardBox hasTable>
          <Formik initialValues={{}} onSubmit={undefined}>
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-1/2 text-center">Vulnerabilities</th>
                  <th className="w-1/2 text-center">Live preview</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "unset" }}>
                  <td className="align-top">
                    {vulnerabilities.map((vulnerability, index) => (
                      <div className="mb-2">
                        <Accordion key={index} title={vulnerability.detailed_title}>
                          <div className="p-4">
                            <FormField label="Description">
                              <Field
                                name={`vulnerabilities[${index}].description`}
                                id={`description-${index}`}
                                component="input"
                                type="text"
                                defaultValue={vulnerability.description}
                              />
                            </FormField>
                            <div className="grid grid-cols-[1fr_auto] gap-4">
                              <FormField label="CVSS Vector">
                                <Field
                                  name={`vulnerabilities[${index}].cvss_vector`}
                                  id={`cvss_vector-${index}`}
                                  component="input"
                                  type="text"
                                  defaultValue={vulnerability.cvss_vector}
                                />
                              </FormField>
                              <div className="mt-[2rem]">
                                <Button
                                  className="h-12"
                                  color="info"
                                  icon={mdiCalculator}
                                  label="Recalculate CVSS"
                                  onClick={() => setIsModalInfoActive(true)}
                                />
                              </div>
                            </div>
                            <div className="mb-[2rem]">
                              <ScoreBar score={vulnerability.cvss_score} />
                            </div>
                            <FormField label="Remediation">
                              <Field
                                name={`vulnerabilities[${index}].remediation`}
                                id={`remediation-${index}`}
                                component="input"
                                type="text"
                                defaultValue={vulnerability.remediation}
                              />
                            </FormField>
                            <FormField label="References">
                              <Field
                                name={`vulnerabilities[${index}].references`}
                                id={`references-${index}`}
                                component="input"
                                type="text"
                                defaultValue={vulnerability.references}
                              />
                            </FormField>
                          </div>
                        </Accordion>
                      </div>
                    ))}
                  </td>
                  <td className="text-center align-top" rowSpan={vulnerabilities.length}>
                    <div style={{ height: "145rem" }}></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default LiveEditor;
