import Button from "../../Button";
import Buttons from "../../Buttons";
import { CVSS3Context } from "./CVSS3Context";

type SelectedValuesType = ReturnType<typeof CVSS3Context>["selectedValues"];

const CVSS3Calculator = ({ updateVectorString }: { updateVectorString: (values: SelectedValuesType) => void }) => {
  const metricLabels = {
    AttackVector: "Attack Vector (AV)",
    AttackComplexity: "Attack Complexity (AC)",
    PrivilegesRequired: "Privileges Required (PR)",
    UserInteraction: "User Interaction (UI)",
    Scope: "Scope (S)",
    Confidentiality: "Confidentiality (C)",
    Integrity: "Integrity (I)",
    Availability: "Availability (A)",
    ExploitCodeMaturity: "Exploit Code Maturity (E)",
    RemediationLevel: "Remediation Level (RL)",
    ReportConfidence: "Report Confidence (RC)",
    ConfidentialityRequirement: "Confidentiality Requirement (CR)",
    IntegrityRequirement: "Integrity Requirement (IR)",
    AvailabilityRequirement: "Availability Requirement (AR)",
    ModifiedAttackVector: "Modified Attack Vector (MAV)",
    ModifiedAttackComplexity: "Modified Attack Complexity (MAC)",
    ModifiedPrivilegesRequired: "Modified Privileges Required (MPR)",
    ModifiedUserInteraction: "Modified User Interaction (MUI)",
    ModifiedScope: "Modified Scope (MS)",
    ModifiedConfidentiality: "Modified Confidentiality (MC)",
    ModifiedIntegrity: "Modified Integrity (MI)",
    ModifiedAvailability: "Modified Availability (MA)",
  };

  const metricValues = {
    AttackVector: { N: "Network", A: "Adjacent Network", L: "Local", P: "Physical" },
    AttackComplexity: { L: "Low", H: "High" },
    PrivilegesRequired: { N: "None", L: "Low", H: "High" },
    UserInteraction: { N: "None", R: "Required" },
    Scope: { U: "Unchanged", C: "Changed" },
    Confidentiality: { N: "None", L: "Low", H: "High" },
    Integrity: { N: "None", L: "Low", H: "High" },
    Availability: { N: "None", L: "Low", H: "High" },
    ExploitCodeMaturity: { X: "Not Defined", U: "Unproven", P: "Proof of Concept", F: "Functional", H: "High" },
    RemediationLevel: { X: "Not Defined", O: "Official Fix", T: "Temporary Fix", W: "Workaround", U: "Unavailable" },
    ReportConfidence: { X: "Not Defined", U: "Unknown", R: "Reasonable", C: "Confirmed" },
    ConfidentialityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    IntegrityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    AvailabilityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    ModifiedAttackVector: { X: "Not Defined", N: "Network", A: "Adjacent Network", L: "Local", P: "Physical" },
    ModifiedAttackComplexity: { X: "Not Defined", L: "Low", H: "High" },
    ModifiedPrivilegesRequired: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedUserInteraction: { X: "Not Defined", N: "None", R: "Required" },
    ModifiedScope: { X: "Not Defined", U: "Unchanged", C: "Changed" },
    ModifiedConfidentiality: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedIntegrity: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedAvailability: { X: "Not Defined", N: "None", L: "Low", H: "High" },
  };

  const { selectedValues, setSelectedValues } = CVSS3Context();

  const handleChange = (key: string, value: string) => {
    setSelectedValues(prev => {
      const updatedValues = { ...prev, [key]: value };
      updateVectorString(updatedValues);
      return updatedValues;
    });
  };

  return (
    <div>
      <form>
        {Object.entries(metricLabels).map(([metricKey, metricLabel]) => (
          <Buttons key={metricKey} label={metricLabel}>
            {Object.entries(metricValues[metricKey]).map(([optionKey, optionObj]) => (
              <Button
                key={optionKey}
                color={selectedValues[metricKey] === optionKey ? "success" : "contrast"}
                label={`${optionObj} (${optionKey})`}
                onClick={() => handleChange(metricKey, optionKey)}
                small
              />
            ))}
          </Buttons>
        ))}
      </form>
    </div>
  );
};

export default CVSS3Calculator;
