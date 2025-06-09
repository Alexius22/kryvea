import Buttons from "../../Form/Buttons";
import Button from "../../Form/Button";
import Grid from "../../Composition/Grid";

const CVSS31Render = ({ updateVectorString, selectedValues, setSelectedValues }) => {
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
    <>
      <div className="grid grid-cols-[2fr,1fr] p-6 pt-0">
        {/* Base Score Metrics */}
        <div>
          <h3 className="text-2xl font-bold">Base Score Metrics</h3>
          <div className="grid grid-cols-2">
            <div>{Object.entries(metricLabels).slice(0, 4).map(renderMetricButtons)}</div>
            <div>{Object.entries(metricLabels).slice(4, 8).map(renderMetricButtons)}</div>
          </div>
        </div>

        {/* Temporal Score Metrics */}
        <div>
          <h3 className="text-2xl font-bold">Temporal Score Metrics</h3>
          <div className="flex flex-col">{Object.entries(metricLabels).slice(8, 11).map(renderMetricButtons)}</div>
        </div>
      </div>

      {/* Environmental Score Metrics */}
      <div className="p-6 pt-0">
        <h3 className="text-2xl font-bold">Environmental Score Metrics</h3>
        <div className="grid grid-cols-3">
          {/* Exploitability Metrics */}
          <div>
            <h4 className="text-xl font-bold">Exploitability Metrics</h4>
            {Object.entries(metricLabels).slice(11, 16).map(renderMetricButtons)}
          </div>

          {/* Impact Metrics */}
          <div>
            <h4 className="text-xl font-bold">Impact Metrics</h4>
            {Object.entries(metricLabels).slice(16, 19).map(renderMetricButtons)}
          </div>

          {/* Impact Subscore Modifiers */}
          <div>
            <h4 className="text-xl font-bold">Impact Subscore Modifiers</h4>
            {Object.entries(metricLabels).slice(19).map(renderMetricButtons)}
          </div>
        </div>
      </div>
    </>
  );

  function renderMetricButtons([metricKey, metricLabel]) {
    return (
      <Buttons key={metricKey} label={metricLabel} className="">
        {Object.entries(metricValues[metricKey]).map(([optionKey, optionObj]) => (
          <Button
            small
            type={optionKey === selectedValues[metricKey] ? "primary" : "secondary"}
            onClick={() => handleChange(metricKey, optionKey)}
            key={`${optionKey}-optionKey`}
            text={`${optionObj} (${optionKey})`}
          />
        ))}
      </Buttons>
    );
  }
};

export default CVSS31Render;
