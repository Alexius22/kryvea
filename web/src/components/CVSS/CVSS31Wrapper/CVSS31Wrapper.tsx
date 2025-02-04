import { Field } from "formik";
import { useState } from "react";
import Accordion from "../../Form/Accordion";
import FormField from "../../Form/Field";
import ScoreBar from "../ScoreBar";
import calculateCVSSFromMetrics, { calculateCVSSFromVector } from "./CVSS31";
import CVSS3Calculator from "./CVSS3Calculator";

export default function CVSS31Wrapper() {
  const [selectedValues, setSelectedValues] = useState({
    AttackVector: "N",
    AttackComplexity: "L",
    PrivilegesRequired: "N",
    UserInteraction: "N",
    Scope: "U",
    Confidentiality: "N",
    Integrity: "N",
    Availability: "N",
    ExploitCodeMaturity: "X",
    RemediationLevel: "X",
    ReportConfidence: "X",
    ConfidentialityRequirement: "X",
    IntegrityRequirement: "X",
    AvailabilityRequirement: "X",
    ModifiedAttackVector: "X",
    ModifiedAttackComplexity: "X",
    ModifiedPrivilegesRequired: "X",
    ModifiedUserInteraction: "X",
    ModifiedScope: "X",
    ModifiedConfidentiality: "X",
    ModifiedIntegrity: "X",
    ModifiedAvailability: "X",
  });
  const [cvssValue, setCvssValue] = useState(calculateCVSSFromMetrics(selectedValues).vectorString);
  const [error, setError] = useState("");

  const handleScoreBar = () => {
    const parsedCvss = cvssValue.startsWith("CVSS:3.1/") ? cvssValue : "CVSS:3.1/" + cvssValue;
    const cvssInfo = calculateCVSSFromVector(parsedCvss, false);
    if ("environmentalMetricScore" in cvssInfo) {
      return cvssInfo.environmentalMetricScore;
    }
    return 0;
  };

  const handleInputChange = e => {
    setCvssValue(e.target.value);
    handleFieldUpdateToSelectedValues(e.target.value);
    setError("");
  };

  const handleFieldUpdateToSelectedValues = onChangeCvssValue => {
    const parsedCvss = onChangeCvssValue.startsWith("CVSS:3.1/") ? onChangeCvssValue : "CVSS:3.1/" + onChangeCvssValue;
    const cvssInfo = calculateCVSSFromVector(parsedCvss, false);
    if ("baseMetricScore" in cvssInfo) {
      const cvssInfo = calculateCVSSFromVector(parsedCvss, true);
      if ("AttackVector" in cvssInfo) {
        const parsedValues = {
          AttackVector: cvssInfo.AttackVector,
          AttackComplexity: cvssInfo.AttackComplexity,
          PrivilegesRequired: cvssInfo.PrivilegesRequired,
          UserInteraction: cvssInfo.UserInteraction,
          Scope: cvssInfo.Scope,
          Confidentiality: cvssInfo.Confidentiality,
          Integrity: cvssInfo.Integrity,
          Availability: cvssInfo.Availability,
          ExploitCodeMaturity: cvssInfo.ExploitCodeMaturity,
          RemediationLevel: cvssInfo.RemediationLevel,
          ReportConfidence: cvssInfo.ReportConfidence,
          ConfidentialityRequirement: cvssInfo.ConfidentialityRequirement,
          IntegrityRequirement: cvssInfo.IntegrityRequirement,
          AvailabilityRequirement: cvssInfo.AvailabilityRequirement,
          ModifiedAttackVector: cvssInfo.ModifiedAttackVector,
          ModifiedAttackComplexity: cvssInfo.ModifiedAttackComplexity,
          ModifiedPrivilegesRequired: cvssInfo.ModifiedPrivilegesRequired,
          ModifiedUserInteraction: cvssInfo.ModifiedUserInteraction,
          ModifiedScope: cvssInfo.ModifiedScope,
          ModifiedConfidentiality: cvssInfo.ModifiedConfidentiality,
          ModifiedIntegrity: cvssInfo.ModifiedIntegrity,
          ModifiedAvailability: cvssInfo.ModifiedAvailability,
        };
        setSelectedValues(parsedValues);
        setError("");
      }
    } else {
      setError("Malformed CVSS Vector");
    }
  };

  const updateVectorString = (updatedValues: typeof selectedValues) => {
    const updatedVectorString = calculateCVSSFromMetrics(updatedValues).vectorString;
    setCvssValue(updatedVectorString);
    setError("");
  };

  return (
    <>
      <FormField
        label={["CVSS vector", "Score"]}
        gridTemplateColumns="grid-cols-[63%_36%]"
        help={error || ""}
        isError={!!error}
      >
        <Field
          name="cvss"
          id="cvss"
          placeholder="CVSS"
          value={cvssValue}
          onChange={handleInputChange}
          isError={!!error}
        />
        <ScoreBar score={handleScoreBar()} />
      </FormField>
      <Accordion title={"CVSS Calculator"}>
        <CVSS3Calculator
          {...{
            selectedValues,
            setSelectedValues,
            updateVectorString,
          }}
        />
      </Accordion>
    </>
  );
}
