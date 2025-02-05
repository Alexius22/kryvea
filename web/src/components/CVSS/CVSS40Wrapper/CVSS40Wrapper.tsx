import { Field } from "formik";
import { useMemo, useState } from "react";
import Accordion from "../../Form/Accordion";
import FormField from "../../Form/Field";
import ScoreBar from "../ScoreBar";
import Vector, { CVSS40 } from "./CVSS40";
import CVSS40Render from "./CVSS40Render";

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
  const metricLabelsShort = useMemo(
    () => ({
      AttackVector: "AV",
      AttackComplexity: "AC",
      AttackRequirements: "AT",
      PrivilegesRequired: "PR",
      UserInteraction: "UI",
      Confidentiality: "VC",
      Integrity: "VI",
      Availability: "VA",
      SubsequentConfidentiality: "SC",
      SubsequentIntegrity: "SI",
      SubsequentAvailability: "SA",
      Safety: "S",
      Automatable: "AU",
      Recovery: "R",
      ValueDensity: "V",
      ResponseEffort: "RE",
      ProviderUrgency: "U",
      ModifiedAttackVector: "MAV",
      ModifiedAttackComplexity: "MAC",
      ModifiedAttackRequirements: "MAT",
      ModifiedPrivilegesRequired: "MPR",
      ModifiedUserInteraction: "MUI",
      ModifiedConfidentiality: "MVC",
      ModifiedIntegrity: "MVI",
      ModifiedAvailability: "MVA",
      ModifiedSubsequentConfidentiality: "MSC",
      ModifiedSubsequentIntegrity: "MSI",
      ModifiedSubsequentAvailability: "MSA",
      ConfidentialityRequirements: "CR",
      IntegrityRequirements: "IR",
      AvailabilityRequirements: "AR",
      ExploitMaturity: "E",
    }),
    []
  );
  const cvssVector = useMemo(() => {
    const baseString = "CVSS:4.0";
    const metricEntries = Object.entries(selectedValues)
      .filter(([, value]) => value !== "X")
      .map(([key, value]) => `/${metricLabelsShort[key]}:${value}`)
      .join("");
    const cvss40string = baseString + metricEntries;
    return cvss40string;
  }, [selectedValues]);

  const [cvss4Score, setCvss4Score] = useState(0);

  const cvss40 = useMemo(() => {
    const instance = new CVSS40(cvssVector);
    setCvss4Score(instance.calculateScore());
    // setSelectedValues(instance.vector.metrics.AV);
    return instance;
  }, [cvssVector]);

  const [cvssValue, setCvssValue] = useState<Metrics>();
  const [error, setError] = useState("");

  const handleInputChange = e => {
    setCvssValue(e.target.value);
    handleFieldUpdateToSelectedValues(e.target.value);
    setError("");
  };

  const handleFieldUpdateToSelectedValues = onChangeCvssValue => {
    const parsedCvss = onChangeCvssValue.startsWith("CVSS:4.0/") ? onChangeCvssValue : "CVSS:4.0/" + onChangeCvssValue;
    if (new Vector().validateStringVector(parsedCvss)) {
      const parsedValues = {
        AttackVector: cvss40.vector.metrics.AV,
        AttackComplexity: cvss40.vector.metrics.AC,
        AttackRequirements: cvss40.vector.metrics.AT,
        PrivilegesRequired: cvss40.vector.metrics.PR,
        UserInteraction: cvss40.vector.metrics.UI,
        Confidentiality: cvss40.vector.metrics.VC,
        Integrity: cvss40.vector.metrics.VI,
        Availability: cvss40.vector.metrics.VA,
        SubsequentConfidentiality: cvss40.vector.metrics.SC,
        SubsequentIntegrity: cvss40.vector.metrics.SI,
        SubsequentAvailability: cvss40.vector.metrics.SA,
        Safety: cvss40.vector.metrics.S,
        Automatable: cvss40.vector.metrics.AU,
        Recovery: cvss40.vector.metrics.R,
        ValueDensity: cvss40.vector.metrics.V,
        ResponseEffort: cvss40.vector.metrics.RE,
        ProviderUrgency: cvss40.vector.metrics.U,
        ModifiedAttackVector: cvss40.vector.metrics.MAV,
        ModifiedAttackComplexity: cvss40.vector.metrics.MAC,
        ModifiedAttackRequirements: cvss40.vector.metrics.MAT,
        ModifiedPrivilegesRequired: cvss40.vector.metrics.MPR,
        ModifiedUserInteraction: cvss40.vector.metrics.MUI,
        ModifiedConfidentiality: cvss40.vector.metrics.MVC,
        ModifiedIntegrity: cvss40.vector.metrics.MVI,
        ModifiedAvailability: cvss40.vector.metrics.MVA,
        ModifiedSubsequentConfidentiality: cvss40.vector.metrics.MSC,
        ModifiedSubsequentIntegrity: cvss40.vector.metrics.MSI,
        ModifiedSubsequentAvailability: cvss40.vector.metrics.MSA,
        ConfidentialityRequirements: cvss40.vector.metrics.CR,
        IntegrityRequirements: cvss40.vector.metrics.IR,
        AvailabilityRequirements: cvss40.vector.metrics.AR,
        ExploitMaturity: cvss40.vector.metrics.E,
      };
      setSelectedValues(parsedValues);
      setError("");
    } else {
      setError("Malformed CVSS Vector");
    }
  };

  const updateVectorString = (updatedValues: typeof selectedValues) => {
    //const updatedVectorString = new Vector().updateMetricsFromVectorString(updatedValues);
    setCvssValue(updatedValues);
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
        <Field name="cvss" id="cvss" value={cvssVector} onChange={handleInputChange} isError={!!error} />
        <ScoreBar score={cvss4Score} />
      </FormField>
      <Accordion title={"CVSS Calculator"}>
        <CVSS40Render
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
