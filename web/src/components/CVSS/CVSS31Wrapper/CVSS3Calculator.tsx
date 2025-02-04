import Button from "../../Button";
import Buttons from "../../Buttons";
import { CVSS3Context } from "./CVSS3Context";

const CVSS3Calculator = ({ updateVectorString, selectedValues, setSelectedValues }) => {
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
    ModifiedAttackVector: "Modified Attack Vector (MAV)",
    ModifiedAttackComplexity: "Modified Attack Complexity (MAC)",
    ModifiedPrivilegesRequired: "Modified Privileges Required (MPR)",
    ModifiedUserInteraction: "Modified User Interaction (MUI)",
    ModifiedScope: "Modified Scope (MS)",
    ModifiedConfidentiality: "Modified Confidentiality (MC)",
    ModifiedIntegrity: "Modified Integrity (MI)",
    ModifiedAvailability: "Modified Availability (MA)",
    ConfidentialityRequirement: "Confidentiality Requirement (CR)",
    IntegrityRequirement: "Integrity Requirement (IR)",
    AvailabilityRequirement: "Availability Requirement (AR)",
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
    ModifiedAttackVector: { X: "Not Defined", N: "Network", A: "Adjacent Network", L: "Local", P: "Physical" },
    ModifiedAttackComplexity: { X: "Not Defined", L: "Low", H: "High" },
    ModifiedPrivilegesRequired: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedUserInteraction: { X: "Not Defined", N: "None", R: "Required" },
    ModifiedScope: { X: "Not Defined", U: "Unchanged", C: "Changed" },
    ModifiedConfidentiality: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedIntegrity: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ModifiedAvailability: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    ConfidentialityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    IntegrityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    AvailabilityRequirement: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
  };

  const handleChange = (key: string, value: string) => {
    setSelectedValues(prev => {
      const updatedValues = { ...prev, [key]: value };
      updateVectorString(updatedValues);
      return updatedValues;
    });
  };

  return (
    <div className="ml-8">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Base Score Metrics */}
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Base Score Metrics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>{Object.entries(metricLabels).slice(0, 4).map(renderMetricButtons)}</div>
            <div>{Object.entries(metricLabels).slice(4, 8).map(renderMetricButtons)}</div>
          </div>
        </div>

        {/* Temporal Score Metrics */}
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Temporal Score Metrics</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Object.entries(metricLabels).slice(8, 11).map(renderMetricButtons)}
          </div>
        </div>
      </div>

      {/* Environmental Score Metrics */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Environmental Score Metrics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {/* Exploitability Metrics */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Exploitability Metrics</h4>
            {Object.entries(metricLabels).slice(11, 16).map(renderMetricButtons)}
          </div>

          {/* Impact Metrics */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Impact Metrics</h4>
            {Object.entries(metricLabels).slice(16, 19).map(renderMetricButtons)}
          </div>

          {/* Impact Subscore Modifiers */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Impact Subscore Modifiers</h4>
            {Object.entries(metricLabels).slice(19).map(renderMetricButtons)}
          </div>
        </div>
      </div>
    </div>
  );

  function renderMetricButtons([metricKey, metricLabel]) {
    return (
      <Buttons key={metricKey} label={metricLabel}>
        {Object.entries(metricValues[metricKey]).map(([optionKey, optionObj]) => (
          <Button
            key={optionKey}
            color={(() => {
              return selectedValues[metricKey] === optionKey ? "success" : "contrast";
            })()}
            label={`${optionObj} (${optionKey})`}
            onClick={() => handleChange(metricKey, optionKey)}
            small
          />
        ))}
      </Buttons>
    );
  }
};

export default CVSS3Calculator;
