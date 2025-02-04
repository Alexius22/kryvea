import { Field } from "formik";
import { useState } from "react";
import Accordion from "../../Form/Accordion";
import FormField from "../../Form/Field";
import calculateCVSSFromMetrics, { calculateCVSSFromVector } from "../CVSS31Wrapper/CVSS31";
import ScoreBar from "../ScoreBar";
import CVSS4Vector from "./CVSS4Vector";

type NALP = "N" | "A" | "L" | "P";
type LH = "L" | "H";
type NP = "N" | "P";
type NPA = "N" | "P" | "A";
type NLH = "N" | "L" | "H";
type XNP = "X" | "N" | "P";
type XNY = "X" | "N" | "Y";
type XAUI = "X" | "A" | "U" | "I";
type XDC = "X" | "D" | "C";
type XLMH = "X" | "L" | "M" | "H";
type XClearGreenAmberRed = "X" | "Clear" | "Green" | "Amber" | "Red";
type XNALP = "X" | "N" | "A" | "L" | "P";
type XLH = "X" | "L" | "H";
type XNPA = "X" | "N" | "P" | "A";
type XNLH = "X" | "N" | "L" | "H";
type XNLHS = "X" | "N" | "L" | "H" | "S";
type XUPA = "X" | "U" | "P" | "A";
type Metrics = {
  AttackVector: NALP;
  AttackComplexity: LH;
  AttackRequirements: NP;
  PrivilegesRequired: NLH;
  UserInteraction: NPA;
  Confidentiality: NLH;
  Integrity: NLH;
  Availability: NLH;
  SubsequentConfidentiality: NLH;
  SubsequentIntegrity: NLH;
  SubsequentAvailability: NLH;
  Safety: XNP;
  Automatable: XNY;
  Recovery: XAUI;
  ValueDensity: XDC;
  ResponseEffort: XLMH;
  ProviderUrgency: XClearGreenAmberRed;
  ModifiedAttackVector: XNALP;
  ModifiedAttackComplexity: XLH;
  ModifiedAttackRequirements: XNP;
  ModifiedPrivilegesRequired: XNLH;
  ModifiedUserInteraction: XNPA;
  ModifiedConfidentiality: XNLH;
  ModifiedIntegrity: XNLH;
  ModifiedAvailability: XNLH;
  ModifiedSubsequentConfidentiality: XNLH;
  ModifiedSubsequentIntegrity: XNLHS;
  ModifiedSubsequentAvailability: XNLHS;
  ConfidentialityRequirements: XLMH;
  IntegrityRequirements: XLMH;
  AvailabilityRequirements: XLMH;
  ExploitMaturity: XUPA;
};

export default function CVSS40Wrapper() {
  const [selectedValues, setSelectedValues] = useState<Metrics>({
    AttackVector: "N",
    AttackComplexity: "L",
    AttackRequirements: "N",
    PrivilegesRequired: "N",
    UserInteraction: "N",
    Confidentiality: "N",
    Integrity: "N",
    Availability: "N",
    SubsequentConfidentiality: "N",
    SubsequentIntegrity: "N",
    SubsequentAvailability: "N",
    Safety: "X",
    Automatable: "X",
    Recovery: "X",
    ValueDensity: "X",
    ResponseEffort: "X",
    ProviderUrgency: "X",
    ModifiedAttackVector: "X",
    ModifiedAttackComplexity: "X",
    ModifiedAttackRequirements: "X",
    ModifiedPrivilegesRequired: "X",
    ModifiedUserInteraction: "X",
    ModifiedConfidentiality: "X",
    ModifiedIntegrity: "X",
    ModifiedAvailability: "X",
    ModifiedSubsequentConfidentiality: "X",
    ModifiedSubsequentIntegrity: "X",
    ModifiedSubsequentAvailability: "X",
    ConfidentialityRequirements: "X",
    IntegrityRequirements: "X",
    AvailabilityRequirements: "X",
    ExploitMaturity: "X",
  });
  const [cvssValue, setCvssValue] = useState(calculateCVSSFromMetrics(selectedValues).vectorString);
  const [error, setError] = useState("");
  const [cvss4Score, setCvss4Score] = useState(0);

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
        <ScoreBar score={cvss4Score} />
      </FormField>
      <Accordion title={"CVSS Calculator"}>
        <CVSS4Vector
          {...{
            setCvss4Score,
            selectedValues,
            setSelectedValues,
            updateVectorString,
          }}
        />
      </Accordion>
    </>
  );
}
