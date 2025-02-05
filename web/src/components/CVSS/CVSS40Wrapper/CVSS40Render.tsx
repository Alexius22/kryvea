import { useMemo } from "react";
import Button from "../../Button";
import Buttons from "../../Buttons";

const CVSS40Render = ({ updateVectorString, selectedValues, setSelectedValues }) => {
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

  const handleChange = (key: string, value: string) => {
    setSelectedValues(prev => {
      const updatedValues = { ...prev, [key]: value };
      updateVectorString(updatedValues);
      return updatedValues;
    });
  };

  return (
    <div className="ml-8">
      {/* Base Metrics */}
      <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Base Metrics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {/* Exploitability Metrics */}
        <div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Exploitability Metrics</h4>
          {Object.entries(metricLabels).slice(0, 5).map(renderMetricButtons)}
        </div>
        {/* Vulnerable System Impact Metrics */}
        <div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Vulnerable System Impact Metrics</h4>
          {Object.entries(metricLabels).slice(5, 8).map(renderMetricButtons)}
        </div>
        {/* Subsequent System Impact Metrics */}
        <div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Subsequent System Impact Metrics</h4>
          {Object.entries(metricLabels).slice(8, 11).map(renderMetricButtons)}
        </div>
      </div>

      {/* Supplemental Metrics */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Supplemental Metrics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <div>{Object.entries(metricLabels).slice(11, 14).map(renderMetricButtons)}</div>
              <div>{Object.entries(metricLabels).slice(14, 17).map(renderMetricButtons)}</div>
            </div>
          </div>
          {/* Threat Metrics */}
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Threat Metrics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              {Object.entries(metricLabels).slice(31, 32).map(renderMetricButtons)}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental (Modified Base Metrics) */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Environmental (Modified Base Metrics)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {/* Exploitability Metrics */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Exploitability Metrics</h4>
            {Object.entries(metricLabels).slice(17, 22).map(renderMetricButtons)}
          </div>
          {/* Vulnerable System Impact Metrics */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Vulnerable System Impact Metrics</h4>
            {Object.entries(metricLabels).slice(22, 25).map(renderMetricButtons)}
          </div>
          {/* Subsequent System Impact Metrics */}
          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Subsequent System Impact Metrics</h4>
            {Object.entries(metricLabels).slice(25, 28).map(renderMetricButtons)}
          </div>
        </div>
      </div>

      {/* Environmental (Security Requirements) */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Environmental (Security Requirements)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {Object.entries(metricLabels).slice(28, 31).map(renderMetricButtons)}
        </div>
      </div>
    </div>
  );

  function renderMetricButtons([metricKey, metricLabel]) {
    return (
      <Buttons key={metricKey} label={metricLabel}>
        {Object.entries(metricValues[metricKey]).map(([optionKey, optionLabel]) => (
          <Button
            key={`${optionLabel}-optionKey`}
            color={selectedValues[metricKey] === optionKey ? "success" : "contrast"}
            label={`${metricValues[metricKey][optionKey]} (${optionKey})`}
            onClick={() => handleChange(metricKey, optionKey)}
            small
          />
        ))}
      </Buttons>
    );
  }
};

export default CVSS40Render;
