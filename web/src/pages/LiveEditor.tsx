import { mdiCalculator } from "@mdi/js";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import Grid from "../components/Composition/Grid";
import CVSS31Wrapper from "../components/CVSS/CVSS31Wrapper/CVSS31Wrapper";
import CVSS40Wrapper from "../components/CVSS/CVSS40Wrapper/CVSS40Wrapper";
import ScoreBar from "../components/CVSS/ScoreBar";
import Accordion from "../components/Form/Accordion";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";
import { vulnerabilities } from "../mockup_data/vulnerabilities";

const sections = [
  {
    title: "Executive Summary",
    subSections: ["Introduction", "Results Summary"],
  },
  {
    title: "Management Overview",
    subSections: [
      "Introduction",
      "Timeline and Scenarios Overview",
      "Vulnerabilities Summary",
      "Conclusions and Recommendation Summary",
    ],
  },
  {
    title: "Vulnerabilities Details",
  },
  {
    title: "Appendix A - Methodology",
    subSections: ["Standards", "Life-Cycle", "Tools", "Scoring"],
  },
  {
    title: "Appendix B - Team Qualifications",
    subSections: ["Introduction", "Certifications", "Collaborations"],
  },
];

const LiveEditor = () => {
  const [content, setContent] = useState({});
  const [isCvss4, setIsCvss4] = useState(false);
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const pdfRef = useRef(null);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
  };

  const handleChange = (section, subSection, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: value,
      },
    }));
  };

  useEffect(() => {
    document.title = getPageTitle("Live Editor");
  });

  return (
    <div>
      <CardBoxModal
        title="Recalculate CVSS"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
        className="overflow-y-auto xl:w-8/12"
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          {isCvss4 ? <CVSS40Wrapper /> : <CVSS31Wrapper />}
        </Formik>
      </CardBoxModal>

      <Grid className="grid-cols-2">
        <CardBox className="">
          <Formik initialValues={{}} onSubmit={undefined}>
            <div className="flex flex-col gap-4">
              {sections.map(({ title, subSections }) => (
                <Accordion key={title} title={title}>
                  {subSections
                    ? subSections.map(sub => (
                        <div key={sub}>
                          <label className="font-bold">{sub}</label>
                          <Input
                            type="text"
                            multiline
                            value={content[title]?.[sub] || ""}
                            onChange={e => handleChange(title, sub, e.target.value)}
                          />
                        </div>
                      ))
                    : title === "Vulnerabilities Details"
                      ? vulnerabilities.map((vulnerability, index) => (
                          <Accordion key={index} title={vulnerability.detailed_title}>
                            <Input
                              type="text"
                              multiline
                              label="Description"
                              id={`description-${index}`}
                              value={vulnerability.description}
                            />
                            <Grid className="grid-cols-[1fr_auto]">
                              <Input
                                type="text"
                                label="CVSS Vector"
                                id={`cvss_vector-${index}`}
                                value={vulnerability.cvss_vector}
                              />
                              <Button
                                className="h-12"
                                icon={mdiCalculator}
                                label="Recalculate CVSS"
                                onClick={() => setIsModalInfoActive(true)}
                              />
                              <ScoreBar score={vulnerability.cvss_score} />
                            </Grid>
                            <Grid>
                              <Input
                                type="text"
                                label="Remediation"
                                id={`remediation-${index}`}
                                multiline
                                value={vulnerability.remediation}
                              />
                              <Input
                                type="text"
                                label="References"
                                id={`references-${index}`}
                                multiline
                                value={vulnerability.references.join("\n")}
                              />
                            </Grid>
                          </Accordion>
                        ))
                      : null}
                </Accordion>
              ))}
            </div>
          </Formik>
        </CardBox>
        <CardBox className="h-[80vh]">
          <iframe ref={pdfRef} />
        </CardBox>
      </Grid>
    </div>
  );
};

export default LiveEditor;
