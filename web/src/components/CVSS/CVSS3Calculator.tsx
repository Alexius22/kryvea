import { useState } from "react";
import Button from "../Button";
import Buttons from "../Buttons";
import ScoreBar from "./ScoreBar";

const CVSS31 = {
  CVSSVersionIdentifier: "CVSS:3.1",
  exploitabilityCoefficient: 8.22,
  scopeCoefficient: 1.08,
  Weight: {
    AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
    AC: { H: 0.44, L: 0.77 },
    PR: {
      U: { N: 0.85, L: 0.62, H: 0.27 },
      C: { N: 0.85, L: 0.68, H: 0.5 },
    },
    UI: { N: 0.85, R: 0.62 },
    S: { U: 6.42, C: 7.52 },
    CIA: { N: 0, L: 0.22, H: 0.56 },
    E: { X: 1, U: 0.91, P: 0.94, F: 0.97, H: 1 },
    RL: { X: 1, O: 0.95, T: 0.96, W: 0.97, U: 1 },
    RC: { X: 1, U: 0.92, R: 0.96, C: 1 },
    CIAR: { X: 1, L: 0.5, M: 1, H: 1.5 },
  },
};

const CVSS3Calculator = ({ onChange, onSubmit }) => {
  const [selectedValues, setSelectedValues] = useState({
    // Base metrics
    AV: null,
    AC: null,
    PR: null,
    UI: null,
    S: null,
    C: null,
    I: null,
    A: null,
    // Temporal metrics
    E: null,
    RL: null,
    RC: null,
    // Environmental metrics
    CR: null,
    IR: null,
    AR: null,
    MAV: null,
    MAC: null,
    MPR: null,
    MUI: null,
    MS: null,
    MC: null,
    MI: null,
    MA: null,
  });

  const [dropdownOpen, setDropdownOpen] = useState(true);

  const bg = {
    AV: "Attack Vector",
    AC: "Attack Complexity",
    PR: "Privileges Required",
    UI: "User Interaction",
    S: "Scope",
    C: "Confidentiality",
    I: "Integrity",
    A: "Availability",
    E: "Exploitability",
    RL: "Remediation Level",
    RC: "Report Confidence",
    MAV: "Modified Attack Vector",
    MAC: "Modified Attack Complexity",
    MPR: "Modified Privileges Required",
    MUI: "Modified User Interaction",
    MS: "Modified Scope",
    MC: "Modified Confidentiality",
    MI: "Modified Integrity",
    MA: "Modified Availability",
    CR: "Confidentiality Requirement",
    IR: "Integrity Requirement",
    AR: "Availability Requirement",
  };

  const bm = {
    AV: { N: "Network", L: "Local", A: "Adjacent", P: "Physical" },
    AC: { L: "Low", H: "High" },
    PR: { N: "None", L: "Low", H: "High" },
    UI: { N: "None", R: "Required" },
    S: { U: "Unchanged", C: "Changed" },
    C: { H: "High", L: "Low", N: "None" },
    I: { H: "High", L: "Low", N: "None" },
    A: { H: "High", L: "Low", N: "None" },
    E: { X: "Not Defined", U: "Unproven", P: "Proof of Concept", F: "Functional", H: "High" },
    RL: { X: "Not Defined", O: "Official", T: "Temporary", W: "Workaround", U: "Unavailable" },
    RC: { X: "Not Defined", U: "Unknown", R: "Reasonable", C: "Confirmed" },
    CR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    IR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    AR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    MAV: { X: "Not Defined", N: "Network", L: "Local", A: "Adjacent", P: "Physical" },
    MAC: { X: "Not Defined", L: "Low", H: "High" },
    MPR: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    MUI: { X: "Not Defined", N: "None", R: "Required" },
    MS: { X: "Not Defined", U: "Unchanged", C: "Changed" },
    MC: { X: "Not Defined", H: "High", L: "Low", N: "None" },
    MI: { X: "Not Defined", H: "High", L: "Low", N: "None" },
    MA: { X: "Not Defined", H: "High", L: "Low", N: "None" },
  };

  const handleChange = (group, value) => {
    const newSelectedValues = { ...selectedValues, [group]: value };

    if (["E", "RL", "RC"].includes(group)) {
      newSelectedValues.E = "X";
      newSelectedValues.RL = "X";
      newSelectedValues.RC = "X";

      if (value !== "X") {
        newSelectedValues[group] = value;
      }
    }
    // Update only the selected metric for environmental metrics
    else if (["CR", "IR", "AR", "MAV", "MAC", "MPR", "MUI", "MS", "MC", "MI", "MA"].includes(group)) {
      if (value !== "X") {
        newSelectedValues[group] = value;
      } else {
        newSelectedValues[group] = "X";
      }
    }

    setSelectedValues(newSelectedValues);
    checkFields(newSelectedValues);
  };

  const checkFields = newSelectedValues => {
    const allSelected = Object.values(newSelectedValues).every(value => value !== null);
    if (allSelected) {
      setDropdownOpen(false);
    }
  };

  const handleModifyDropdown = () => {
    setDropdownOpen(true);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(selectedValues);
    }
  };

  const calculateCVSS = selectedValues => {
    const { AV, AC, PR, UI, S, C, I, A, E, RL, RC, CR, IR, AR, MAV, MAC, MPR, MUI, MS, MC, MI, MA } = selectedValues;

    if (!AV || !AC || !PR || !UI || !S || !C || !I || !A) return 0; // Base metrics only

    const impactSubScore = 1 - (1 - CVSS31.Weight.CIA[C]) * (1 - CVSS31.Weight.CIA[I]) * (1 - CVSS31.Weight.CIA[A]);

    let impact;
    if (S === "U") {
      impact = CVSS31.Weight.S.U * impactSubScore;
    } else {
      impact = CVSS31.Weight.S.C * (impactSubScore - 0.029) - 3.25 * Math.pow(impactSubScore - 0.02, 15);
    }

    // Exploitability Sub-Score Calculation
    const exploitability =
      CVSS31.exploitabilityCoefficient *
      CVSS31.Weight.AV[AV] *
      CVSS31.Weight.AC[AC] *
      CVSS31.Weight.PR[S][PR] *
      CVSS31.Weight.UI[UI];

    let baseScore;
    if (impact <= 0) {
      baseScore = 0;
    } else {
      if (S === "U") {
        baseScore = roundUp1(Math.min(impact + exploitability, 10));
      } else {
        baseScore = roundUp1(Math.min(CVSS31.scopeCoefficient * (impact + exploitability), 10));
      }
    }

    // Temporal metrics adjustment (only add if at least one metric is selected)
    const temporalMetrics = { E, RL, RC };
    if (E !== "X" || RL !== "X" || RC !== "X") {
      temporalMetrics.E = E !== "X" ? E : "X";
      temporalMetrics.RL = RL !== "X" ? RL : "X";
      temporalMetrics.RC = RC !== "X" ? RC : "X";
      var temporalScore = roundUp1(baseScore * CVSS31.Weight.E[E] * CVSS31.Weight.RL[RL] * CVSS31.Weight.RC[RC]);
    } else {
      // Skip temporal metrics if all are "X"
      temporalMetrics.E = "X";
      temporalMetrics.RL = "X";
      temporalMetrics.RC = "X";
    }

    var miss; /* Modified Impact Sub-Score */
    var modifiedImpact;
    var envScore;
    var modifiedExploitability;

    // Environmental metrics adjustment (only add if at least one metric is selected)
    const environmentalMetrics = { CR, IR, AR, MAV, MAC, MPR, MUI, MS, MC, MI, MA };

    if (
      CR !== "X" ||
      IR !== "X" ||
      AR !== "X" ||
      MAV !== "X" ||
      MAC !== "X" ||
      MPR !== "X" ||
      MUI !== "X" ||
      MS !== "X" ||
      MC !== "X" ||
      MI !== "X" ||
      MA !== "X"
    ) {
      environmentalMetrics.CR = CR !== "X" ? CR : "X";
      environmentalMetrics.IR = IR !== "X" ? IR : "X";
      environmentalMetrics.AR = AR !== "X" ? AR : "X";
      environmentalMetrics.MAV = MAV !== "X" ? MAV : "X";
      environmentalMetrics.MAC = MAC !== "X" ? MAC : "X";
      environmentalMetrics.MPR = MPR !== "X" ? MPR : "X";
      environmentalMetrics.MUI = MUI !== "X" ? MUI : "X";
      environmentalMetrics.MS = MS !== "X" ? MS : "X";
      environmentalMetrics.MC = MC !== "X" ? MC : "X";
      environmentalMetrics.MI = MI !== "X" ? MI : "X";
      environmentalMetrics.MA = MA !== "X" ? MA : "X";

      miss = Math.min(
        1 -
          (1 - CVSS31.Weight.CIA[MC] * CVSS31.Weight.CIA[CR]) *
            (1 - CVSS31.Weight.CIA[MI] * CVSS31.Weight.CIA[IR]) *
            (1 - CVSS31.Weight.CIA[MA] * CVSS31.Weight.CIA[AR]),
        0.915
      );

      if (environmentalMetrics.MS === "U" || (environmentalMetrics.MS === "X" && CVSS31.Weight.S[S] === "U")) {
        modifiedImpact = CVSS31.Weight.CIA[MS] * miss;
      } else {
        modifiedImpact = CVSS31.Weight.CIA[MS] * (miss - 0.029) - 3.25 * Math.pow(miss * 0.9731 - 0.02, 13);
      }
      if (modifiedImpact <= 0) {
        envScore = 0;
      } else if (environmentalMetrics.MS === "U" || (environmentalMetrics.MS === "X" && CVSS31.Weight.S[S] === "U")) {
        envScore = roundUp1(
          roundUp1(Math.min(modifiedImpact + modifiedExploitability, 10)) *
            CVSS31.Weight.E[E] *
            CVSS31.Weight.RL[RL] *
            CVSS31.Weight.RC[RC]
        );
      } else {
        envScore = roundUp1(
          roundUp1(Math.min(CVSS31.scopeCoefficient * (modifiedImpact + modifiedExploitability), 10)) *
            CVSS31.Weight.E[E] *
            CVSS31.Weight.RL[RL] *
            CVSS31.Weight.RC[RC]
        );
      }
    } else {
      // Skip environmental metrics if all are "X"
      environmentalMetrics.CR = "X";
      environmentalMetrics.IR = "X";
      environmentalMetrics.AR = "X";
      environmentalMetrics.MAV = "X";
      environmentalMetrics.MAC = "X";
      environmentalMetrics.MPR = "X";
      environmentalMetrics.MUI = "X";
      environmentalMetrics.MS = "X";
      environmentalMetrics.MC = "X";
      environmentalMetrics.MI = "X";
      environmentalMetrics.MA = "X";
    }
    const severity = getSeverity(baseScore);
    const vector = generateVectorString(selectedValues, temporalMetrics, environmentalMetrics);

    return {
      baseScore: baseScore,
      temporalScore: temporalScore,
      envScore: envScore,
      severity,
      vector,
    };
  };

  const roundUp1 = value => Math.ceil(value * 10) / 10;

  const getSeverity = score => {
    const severityRatings = [
      { name: "None", bottom: 0.0, top: 0.0 },
      { name: "Low", bottom: 0.1, top: 3.9 },
      { name: "Medium", bottom: 4.0, top: 6.9 },
      { name: "High", bottom: 7.0, top: 8.9 },
      { name: "Critical", bottom: 9.0, top: 10.0 },
    ];

    const severity = severityRatings.find(rating => score >= rating.bottom && score <= rating.top);
    return severity ? severity.name : "Unknown";
  };

  const generateVectorString = (selectedValues, temporalMetrics, environmentalMetrics) => {
    const vectorParts = [];

    const baseMetrics = [
      { name: "AV", value: selectedValues.AV },
      { name: "AC", value: selectedValues.AC },
      { name: "PR", value: selectedValues.PR },
      { name: "UI", value: selectedValues.UI },
      { name: "S", value: selectedValues.S },
      { name: "C", value: selectedValues.C },
      { name: "I", value: selectedValues.I },
      { name: "A", value: selectedValues.A },
    ];

    // Add selected base metrics to the vector
    baseMetrics.forEach(metric => {
      if (metric.value !== null && metric.value !== undefined) {
        vectorParts.push(`${metric.name}:${metric.value}`);
      }
    });

    // Temporal metrics (only add them if at least one is selected)
    const temporalMetricsKeys = ["E", "RL", "RC"];
    const temporalSelected = temporalMetricsKeys.some(key => temporalMetrics[key] && temporalMetrics[key] !== "X");

    if (temporalSelected) {
      temporalMetricsKeys.forEach(key => {
        const value = temporalMetrics[key] || "X"; // Default to "X" if not selected
        vectorParts.push(`${key}:${value}`);
      });
    }

    // Environmental metrics (only add them if at least one is selected)
    const environmentalMetricsKeys = ["CR", "IR", "AR", "MAV", "MAC", "MPR", "MUI", "MS", "MC", "MI", "MA"];
    const environmentalSelected = environmentalMetricsKeys.some(
      key => environmentalMetrics[key] && environmentalMetrics[key] !== "X"
    );

    if (environmentalSelected) {
      environmentalMetricsKeys.forEach(key => {
        const value = environmentalMetrics[key] || "X"; // Default to "X" if not selected
        vectorParts.push(`${key}:${value}`);
      });
    }

    return vectorParts.join("/");
  };

  const cvss_info = calculateCVSS(selectedValues);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {Object.keys(bg)
          .slice(0, 8)
          .map(key => (
            <Buttons key={key} label={bg[key]}>
              {Object.keys(bm[key]).map(optionKey => (
                <Button
                  key={optionKey}
                  color={selectedValues[key] === optionKey ? "success" : "contrast"}
                  label={`${bm[key][optionKey]} (${optionKey})`}
                  onClick={() => handleChange(key, optionKey)}
                />
              ))}
            </Buttons>
          ))}
        {Object.keys(bg)
          .slice(8, 11)
          .map(key => (
            <Buttons key={key} label={bg[key]}>
              {Object.keys(bm[key]).map(optionKey => (
                <Button
                  key={optionKey}
                  color={selectedValues[key] === optionKey ? "success" : "contrast"}
                  label={`${bm[key][optionKey]} (${optionKey})`}
                  onClick={() => handleChange(key, optionKey)}
                />
              ))}
            </Buttons>
          ))}
        {Object.keys(bg)
          .slice(11)
          .map(key => (
            <Buttons key={key} label={bg[key]}>
              {Object.keys(bm[key]).map(optionKey => (
                <Button
                  key={optionKey}
                  color={selectedValues[key] === optionKey ? "success" : "contrast"}
                  label={`${bm[key][optionKey]} (${optionKey})`}
                  onClick={() => handleChange(key, optionKey)}
                />
              ))}
            </Buttons>
          ))}

        {cvss_info === 0 ? null : (
          <>
            <ScoreBar score={cvss_info.baseScore} />
            <p>baseScore: {cvss_info.baseScore}</p>
            <p>envScore: {cvss_info.envScore}</p>
            <p>temporalScore: {cvss_info.temporalScore}</p>
            <p>Severity: {cvss_info.severity}</p>
            <p>Vector: {cvss_info.vector}</p>
          </>
        )}
      </form>
    </div>
  );
};

export default CVSS3Calculator;
