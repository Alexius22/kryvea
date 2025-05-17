import { mdiCalculator } from "@mdi/js";
import { Field, Formik } from "formik";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import CVSS31Wrapper from "../components/CVSS/CVSS31Wrapper/CVSS31Wrapper";
import CVSS40Wrapper from "../components/CVSS/CVSS40Wrapper/CVSS40Wrapper";
import ScoreBar from "../components/CVSS/ScoreBar";
import Accordion from "../components/Form/Accordion";
import FormField from "../components/Form/Field";
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

  const generatePDF = useCallback(async () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "normal");

    let y = 10; // Starting Y position
    const lineHeight = 6; // Space between rows
    const tableOfContents: { title: string; page: number }[] = [];

    // === Table of Contents ===
    doc.setFontSize(16);
    doc.setFont("Helvetica", "bold");
    doc.text("Table of Contents", 10, y);
    y += lineHeight;

    sections.forEach(({ title }, index) => {
      let sectionNumber = `${index + 1}`;

      // Push section to table of contents without indentation
      tableOfContents.push({ title: `${sectionNumber}. ${title}`, page: doc.internal.pages.length });

      // Section title (Heading 1)
      doc.setFontSize(16);
      doc.setFont("Helvetica", "bold");
      doc.text(`${sectionNumber}. ${title}`, 10, y);
      y += lineHeight; // Automatically adjust spacing after section title
    });

    // === Add Vulnerability Table ===
    doc.addPage();
    y = 10;
    doc.text("Vulnerability Overview", 10, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Vulnerability", "Severity", "CVSS Score", "Host"]],
      body: vulnerabilities.map(vuln => [vuln.detailed_title, vuln.cvss_severity, vuln.cvss_score, vuln.target.ip]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    });

    // === Render Sections ===
    sections.forEach(({ title, subSections }, index) => {
      let sectionNumber = `${index + 1}`;

      // Heading 2 for Section Title
      doc.setFontSize(13);
      doc.setFont("Helvetica", "bold");
      doc.addPage();
      doc.text(`${sectionNumber}. ${title}`, 10, y);
      y += lineHeight;

      if (subSections) {
        subSections.forEach((sub, subIndex) => {
          let subSectionNumber = `${sectionNumber}.${subIndex + 1}`;

          // Heading 3 for Subsection Title
          doc.setFontSize(12);
          doc.setFont("Helvetica", "normal");
          doc.text(`${subSectionNumber} ${sub}`, 10, y);
          y += lineHeight;

          doc.text(content[title]?.[sub] || "", 10, y);
          y += lineHeight;
        });
      } else if (title === "Vulnerabilities Details") {
        vulnerabilities.forEach((vuln, vulnIndex) => {
          // Heading 4 for Vulnerability Details
          doc.setFontSize(11);
          doc.setFont("Helvetica", "bold");
          doc.text(`${sectionNumber}.${vulnIndex + 1} ${vuln.detailed_title}`, 10, y);
          y += lineHeight;

          // Numbered headings for Description, Remediation, References
          doc.setFontSize(11);
          doc.setFont("Helvetica", "bold");
          doc.text(`${sectionNumber}.${vulnIndex + 1}.1 Description`, 10, y);
          y += lineHeight;
          doc.setFont("Helvetica", "normal");
          doc.text(vuln.description, 10, y, { maxWidth: 180 });
          y += lineHeight;

          doc.setFont("Helvetica", "bold");
          doc.text(`${sectionNumber}.${vulnIndex + 1}.2 Score and impact CVSS`, 10, y);
          y += lineHeight;
          doc.setFont("Helvetica", "normal");
          doc.text(vuln.cvss_description, 10, y, { maxWidth: 180 });
          y += lineHeight;

          doc.setFont("Helvetica", "bold");
          doc.text(`${sectionNumber}.${vulnIndex + 1}.3 Remediation`, 10, y);
          y += lineHeight;
          doc.setFont("Helvetica", "normal");
          doc.text(vuln.remediation, 10, y, { maxWidth: 180 });
          y += lineHeight;
          doc.text(String(vuln.cvss_score), 10, y, { maxWidth: 180 });
          y += lineHeight;
          doc.text(vuln.cvss_vector, 10, y, { maxWidth: 180 });
          y += lineHeight;

          doc.setFont("Helvetica", "bold");
          doc.text(`${sectionNumber}.${vulnIndex + 1}.4 References`, 10, y);
          y += lineHeight;
          doc.setFont("Helvetica", "normal");
          vuln.references.forEach(reference => {
            doc.text(reference, 10, y, { maxWidth: 180 }); // Each reference listed below the other
            y += lineHeight;
          });

          y += lineHeight * 2; // Adjust for the content size, add spacing after section
        });
      }
    });

    if (pdfRef.current) {
      pdfRef.current.src = URL.createObjectURL(doc.output("blob"));
    }
  }, [content]);

  useEffect(() => {
    document.title = getPageTitle("Live Editor");
    generatePDF();
  }, [generatePDF]);

  return (
    <div>
      <CardBoxModal
        title="Recalculate CVSS"
        buttonColor="info"
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

      <div className="grid grid-cols-2 gap-4">
        <CardBox>
          <Formik initialValues={{}} onSubmit={undefined}>
            {sections.map(({ title, subSections }) => (
              <Accordion key={title} title={title}>
                <div className="px-4">
                  {subSections
                    ? subSections.map(sub => (
                        <div key={sub}>
                          <label className="font-bold">{sub}</label>
                          <Field
                            as="textarea"
                            className="mt-2 h-32 w-full max-w-full rounded border border-gray-700 bg-white px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring focus:ring-blue-600 dark:bg-slate-800 dark:placeholder-gray-400"
                            value={content[title]?.[sub] || ""}
                            onChange={e => handleChange(title, sub, e.target.value)}
                          />
                        </div>
                      ))
                    : title === "Vulnerabilities Details"
                      ? vulnerabilities.map((vulnerability, index) => (
                          <Accordion key={index} title={vulnerability.detailed_title}>
                            <div className="p-4">
                              <FormField label="Description" hasTextareaHeight>
                                <Field
                                  name={`vulnerabilities[${index}].description`}
                                  id={`description-${index}`}
                                  as="textarea"
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
                              <FormField label="Remediation" hasTextareaHeight>
                                <Field
                                  name={`vulnerabilities[${index}].remediation`}
                                  id={`remediation-${index}`}
                                  as="textarea"
                                  defaultValue={vulnerability.remediation}
                                />
                              </FormField>
                              <FormField label="References" hasTextareaHeight>
                                <Field
                                  name={"references"}
                                  id={`references-${index}`}
                                  as="textarea"
                                  defaultValue={vulnerability.references.join("\n")}
                                />
                              </FormField>
                            </div>
                          </Accordion>
                        ))
                      : null}
                </div>
              </Accordion>
            ))}
          </Formik>
        </CardBox>
        <CardBox>
          <iframe ref={pdfRef} className="h-[80vh] w-full border" />
        </CardBox>
      </div>
    </div>
  );
};

export default LiveEditor;
