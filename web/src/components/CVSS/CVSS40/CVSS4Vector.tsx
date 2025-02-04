import { useMemo } from "react";
import Button from "../../Button";
import Buttons from "../../Buttons";
import { CVSS40 } from "./CVSS40";

const CVSS4Vector = ({ selectedValues, setSelectedValues, setCvss4Score }) => {
  const metricLabels = useMemo(
    () => ({
      AttackVector: "Attack Vector (AV)",
      AttackComplexity: "Attack Complexity (AC)",
      AttackRequirements: "Attack Requirements (AT)",
      PrivilegesRequired: "Privileges Required (PR)",
      UserInteraction: "User Interaction (UI)",
      Confidentiality: "Confidentiality (VC)",
      Integrity: "Integrity (VI)",
      Availability: "Availability (VA)",
      SubsequentConfidentiality: "Confidentiality (SC)",
      SubsequentIntegrity: "Integrity (SI)",
      SubsequentAvailability: "Availability (SA)",
      Safety: "Safety (S)",
      Automatable: "Automatable (AU)",
      Recovery: "Recovery (R)",
      ValueDensity: "Value Density (V)",
      ResponseEffort: "Vulnerability Response Effort (RE)",
      ProviderUrgency: "Provider Urgency (U)",
      ModifiedAttackVector: "Attack Vector (MAV)",
      ModifiedAttackComplexity: "Attack Complexity (MAC)",
      ModifiedAttackRequirements: "Attack Requirements (MAT)",
      ModifiedPrivilegesRequired: "Privileges Required (MPR)",
      ModifiedUserInteraction: "User Interaction (MUI)",
      ModifiedConfidentiality: "Confidentiality (MVC)",
      ModifiedIntegrity: "Integrity (MVI)",
      ModifiedAvailability: "Availability (MVA)",
      ModifiedSubsequentConfidentiality: "Confidentiality (MSC)",
      ModifiedSubsequentIntegrity: "Integrity (MSI)",
      ModifiedSubsequentAvailability: "Availability (MSA)",
      ConfidentialityRequirements: "Confidentiality Requirements (CR)",
      IntegrityRequirements: "Integrity Requirements (IR)",
      AvailabilityRequirements: "Availability Requirements (AR)",
      ExploitMaturity: "Exploit Maturity (E)",
    }),
    []
  );

  const metricValues = useMemo(
    () => ({
      AttackVector: { N: "Network", A: "Adjacent", L: "Local", P: "Physical" },
      AttackComplexity: { L: "Low", H: "High" },
      AttackRequirements: { N: "None", P: "Present" },
      PrivilegesRequired: { N: "None", L: "Low", H: "High" },
      UserInteraction: { N: "None", P: "Passive", A: "Active" },
      Confidentiality: { N: "None", L: "Low", H: "High" },
      Integrity: { N: "None", L: "Low", H: "High" },
      Availability: { N: "None", L: "Low", H: "High" },
      SubsequentConfidentiality: { N: "None", L: "Low", H: "High" },
      SubsequentIntegrity: { N: "None", L: "Low", H: "High" },
      SubsequentAvailability: { N: "None", L: "Low", H: "High" },
      Safety: { X: "Not Defined", N: "Negligible", P: "Present" },
      Automatable: { X: "Not Defined", N: "No", Y: "Yes" },
      Recovery: { X: "Not Defined", A: "Automatic", U: "User", I: "Irrecoverable" },
      ValueDensity: { X: "Not Defined", D: "Diffuse", C: "Concentrated" },
      ResponseEffort: { X: "Not Defined", L: "Low", M: "Moderate", H: "High" },
      ProviderUrgency: { X: "Not Defined", Clear: "Clear", Green: "Green", Amber: "Amber", Red: "Red" },
      ModifiedAttackVector: { X: "Not Defined", N: "Network", A: "Adjacent", L: "Local", P: "Physical" },
      ModifiedAttackComplexity: { X: "Not Defined", L: "Low", H: "High" },
      ModifiedAttackRequirements: { X: "Not Defined", N: "None", P: "Present" },
      ModifiedPrivilegesRequired: { X: "Not Defined", N: "None", L: "Low", H: "High" },
      ModifiedUserInteraction: { X: "Not Defined", N: "None", P: "Passive", A: "Active" },
      ModifiedConfidentiality: { X: "Not Defined", N: "None", L: "Low", H: "High" },
      ModifiedIntegrity: { X: "Not Defined", N: "None", L: "Low", H: "High" },
      ModifiedAvailability: { X: "Not Defined", N: "None", L: "Low", H: "High" },
      ModifiedSubsequentConfidentiality: { X: "Not Defined", N: "Negligible", L: "Low", H: "High" },
      ModifiedSubsequentIntegrity: { X: "Not Defined", N: "Negligible", L: "Low", H: "High", S: "Safety" },
      ModifiedSubsequentAvailability: { X: "Not Defined", N: "Negligible", L: "Low", H: "High", S: "Safety" },
      ConfidentialityRequirements: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
      IntegrityRequirements: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
      AvailabilityRequirements: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
      ExploitMaturity: { X: "Not Defined", U: "Unreported", P: "POC", A: "Attacked" },
    }),
    []
  );

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

  const updateMetric = (metricKey, value) => {
    setSelectedValues(prev => ({ ...prev, [metricKey]: value }));
  };

  const raw = useMemo(() => {
    const baseString = "CVSS:4.0";
    const metricEntries = Object.entries(selectedValues)
      .filter(([, value]) => value !== "X")
      .map(([key, value]) => `/${metricLabelsShort[key]}:${value}`)
      .join("");
    const cvss40string = baseString + metricEntries;
    return cvss40string;
  }, [selectedValues]);

  const cvss40 = useMemo(() => {
    const instance = new CVSS40(raw);
    setCvss4Score(instance.calculateScore());
    setSelectedValues(instance.vector.metrics);
    return instance;
  }, [raw]);

  return (
    <div>
      <h3>Generated Vector: {raw}</h3>
      {Object.entries(metricLabels).map(([metricKey, label]) => (
        <Buttons key={metricKey} label={label}>
          {Object.entries(metricValues[metricKey]).map(([optionKey, optionLabel]) => (
            <Button
              key={`${optionLabel}-optionKey`}
              color={selectedValues[metricKey] === optionKey ? "success" : "contrast"}
              label={`${metricValues[metricKey][optionKey]} (${optionKey})`}
              onClick={() => updateMetric(metricKey, optionKey)}
              small
            />
          ))}
        </Buttons>
      ))}
    </div>
  );
};

export default CVSS4Vector;
