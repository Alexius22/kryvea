import { mdiCalculator } from "@mdi/js";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import CVSS31Wrapper from "../components/CVSS/CVSS31Wrapper/CVSS31Wrapper";
import CVSS40Wrapper from "../components/CVSS/CVSS40Wrapper/CVSS40Wrapper";
import ScoreBar from "../components/CVSS/ScoreBar";
import Accordion from "../components/Form/Accordion";
import Button from "../components/Form/Button";
import Input from "../components/Form/Input";
import Textarea from "../components/Form/Textarea";
import { getPageTitle } from "../config";

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

export default function LiveEditor() {
  const [content, setContent] = useState({});
  const [isCvss4, setIsCvss4] = useState(false);
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const pdfRef = useRef(null);

  const vulnerabilities = [
    {
      detailed_title: "Vulnerability 1",
      description: "Description of vulnerability 1",
      cvss_vector: "CVSS Vector 1",
      cvss_score: 7.5,
      remediation: "Remediation for vulnerability 1",
      references: ["Reference 1", "Reference 2"],
    },
    {
      detailed_title: "Vulnerability 2",
      description: "Description of vulnerability 2",
      cvss_vector: "CVSS Vector 2",
      cvss_score: 5.0,
      remediation: "Remediation for vulnerability 2",
      references: ["Reference 3", "Reference 4"],
    },
  ];

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
      <Modal
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
      </Modal>

      <Grid className="grid-cols-2">
        <Card>
          <Formik initialValues={{}} onSubmit={undefined}>
            <div className="flex flex-col gap-4">
              {sections.map(({ title, subSections }) => (
                <Accordion key={title} title={title}>
                  {subSections
                    ? subSections.map(sub => (
                        <div key={sub}>
                          <label className="font-bold">{sub}</label>
                          <Textarea
                            value={content[title]?.[sub] || ""}
                            onChange={e => handleChange(title, sub, e.target.value)}
                          />
                        </div>
                      ))
                    : title === "Vulnerabilities Details"
                      ? vulnerabilities.map((vulnerability, index) => (
                          <Accordion key={index} title={vulnerability.detailed_title}>
                            <Textarea
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
                                text="Recalculate CVSS"
                                onClick={() => setIsModalInfoActive(true)}
                              />
                              <ScoreBar score={vulnerability.cvss_score} />
                            </Grid>
                            <Grid>
                              <Textarea
                                label="Remediation"
                                id={`remediation-${index}`}
                                value={vulnerability.remediation}
                              />
                              <Textarea
                                label="References"
                                id={`references-${index}`}
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
        </Card>
        <Card className="h-[80vh]">
          <iframe ref={pdfRef} />
        </Card>
      </Grid>
    </div>
  );
}
