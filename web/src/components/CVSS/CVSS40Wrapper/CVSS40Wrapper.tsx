import { Field } from "formik";
import { useEffect, useMemo, useState } from "react";
import Accordion from "../../Form/Accordion";
import FormField from "../../Form/Field";
import ScoreBar from "../ScoreBar";
import Vector, { CVSS40 } from "./CVSS40";
import CVSS40Render from "./CVSS40Render";
import Grid from "../../Composition/Grid";
import Input from "../../Form/Input";

type NALP = "N" | "A" | "L" | "P";
type LH = "L" | "H";
type NP = "N" | "P";
type NPA = "N" | "P" | "A";
type NLH = "N" | "L" | "H";
type XUPA = "X" | "U" | "P" | "A";
type XLMH = "X" | "L" | "M" | "H";
type XNALP = "X" | "N" | "A" | "L" | "P";
type XLH = "X" | "L" | "H";
type XNP = "X" | "N" | "P";
type XNLH = "X" | "N" | "L" | "H";
type XNPA = "X" | "N" | "P" | "A";
type XNLHS = "X" | "N" | "L" | "H" | "S";
type XNY = "X" | "N" | "Y";
type XAUI = "X" | "A" | "U" | "I";
type XDC = "X" | "D" | "C";
type XClearGreenAmberRed = "X" | "Clear" | "Green" | "Amber" | "Red";
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
  ExploitMaturity: XUPA;
  ConfidentialityRequirements: XLMH;
  IntegrityRequirements: XLMH;
  AvailabilityRequirements: XLMH;
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
  Safety: XNP;
  Automatable: XNY;
  Recovery: XAUI;
  ValueDensity: XDC;
  ResponseEffort: XLMH;
  ProviderUrgency: XClearGreenAmberRed;
};

export default function CVSS40Wrapper() {
  const [selectedValues, setSelectedValues] = useState({
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
    ExploitMaturity: "X",
    ConfidentialityRequirements: "X",
    IntegrityRequirements: "X",
    AvailabilityRequirements: "X",
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
    Safety: "X",
    Automatable: "X",
    Recovery: "X",
    ValueDensity: "X",
    ResponseEffort: "X",
    ProviderUrgency: "X",
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
      ExploitMaturity: "E",
      ConfidentialityRequirements: "CR",
      IntegrityRequirements: "IR",
      AvailabilityRequirements: "AR",
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
      Safety: "S",
      Automatable: "AU",
      Recovery: "R",
      ValueDensity: "V",
      ResponseEffort: "RE",
      ProviderUrgency: "U",
    }),
    []
  );
  const [cvssValue, setCvssValue] = useState<string>("");
  const [cvss4Score, setCvss4Score] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const validateCvssVector = (vector: string): boolean => {
    const vectorInstance = new Vector();
    const isValid = vectorInstance.validateStringVector(vector);
    if (!isValid) {
      setError("Malformed CVSS Vector");
    } else {
      setError("");
    }
    return isValid;
  };

  const cvssVector = useMemo(() => {
    const baseString = "CVSS:4.0";
    const metricEntries = Object.entries(selectedValues)
      .filter(([, value]) => value !== "X")
      .map(([key, value]) => `/${metricLabelsShort[key]}:${value}`)
      .join("");

    return baseString + metricEntries;
  }, [selectedValues]);

  const displayCvssVector = isEditing ? cvssValue : cvssVector;

  useEffect(() => {
    const instance = new CVSS40(cvssVector);
    setCvss4Score(instance.calculateScore());
  }, [cvssVector]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCvssValue = e.target.value;
    const parsedCvss = newCvssValue.startsWith("CVSS:4.0/") ? newCvssValue : "CVSS:4.0/" + newCvssValue;
    setCvssValue(parsedCvss);
    setIsEditing(true);

    if (validateCvssVector(parsedCvss)) {
      handleFieldUpdateToSelectedValues(parsedCvss);
      setIsEditing(false);
    }
  };

  const handleFieldUpdateToSelectedValues = (onChangeCvssValue: string) => {
    if (validateCvssVector(onChangeCvssValue)) {
      const parsedVector = new Vector(onChangeCvssValue);
      const parsedValues: Metrics = {
        AttackVector: parsedVector.metrics.AV,
        AttackComplexity: parsedVector.metrics.AC,
        AttackRequirements: parsedVector.metrics.AT,
        PrivilegesRequired: parsedVector.metrics.PR,
        UserInteraction: parsedVector.metrics.UI,
        Confidentiality: parsedVector.metrics.VC,
        Integrity: parsedVector.metrics.VI,
        Availability: parsedVector.metrics.VA,
        SubsequentConfidentiality: parsedVector.metrics.SC,
        SubsequentIntegrity: parsedVector.metrics.SI,
        SubsequentAvailability: parsedVector.metrics.SA,
        ExploitMaturity: parsedVector.metrics.E,
        ConfidentialityRequirements: parsedVector.metrics.CR,
        IntegrityRequirements: parsedVector.metrics.IR,
        AvailabilityRequirements: parsedVector.metrics.AR,
        ModifiedAttackVector: parsedVector.metrics.MAV,
        ModifiedAttackComplexity: parsedVector.metrics.MAC,
        ModifiedAttackRequirements: parsedVector.metrics.MAT,
        ModifiedPrivilegesRequired: parsedVector.metrics.MPR,
        ModifiedUserInteraction: parsedVector.metrics.MUI,
        ModifiedConfidentiality: parsedVector.metrics.MVC,
        ModifiedIntegrity: parsedVector.metrics.MVI,
        ModifiedAvailability: parsedVector.metrics.MVA,
        ModifiedSubsequentConfidentiality: parsedVector.metrics.MSC,
        ModifiedSubsequentIntegrity: parsedVector.metrics.MSI,
        ModifiedSubsequentAvailability: parsedVector.metrics.MSA,
        Safety: parsedVector.metrics.S,
        Automatable: parsedVector.metrics.AU,
        Recovery: parsedVector.metrics.R,
        ValueDensity: parsedVector.metrics.V,
        ResponseEffort: parsedVector.metrics.RE,
        ProviderUrgency: parsedVector.metrics.U,
      };
      setSelectedValues(parsedValues);
      setCvssValue(onChangeCvssValue);
      setError("");
    }
  };

  const updateVectorString = (updatedValues: string) => {
    setCvssValue(updatedValues);
    setError("");
  };

  return (
    <>
      <Grid className="grid-cols-[63%_36%]">
        <Input type="text" label="CVSS vector" id="cvss" value={displayCvssVector} onChange={handleInputChange} />
        <ScoreBar score={cvss4Score} />
      </Grid>
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
