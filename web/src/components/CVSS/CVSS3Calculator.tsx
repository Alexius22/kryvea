import { useState } from "react";
import Button from "../Button";
import Buttons from "../Buttons";
import CVSS31 from "./CVSS31";
import ScoreBar from "./ScoreBar";

const CVSSCalculator = () => {
  const bg = {
    AV: "Attack Vector (AV)",
    AC: "Attack Complexity (AC)",
    PR: "Privileges Required (PR)",
    UI: "User Interaction (UI)",
    S: "Scope (S)",
    C: "Confidentiality (C)",
    I: "Integrity (I)",
    A: "Availability (A)",
    E: "Exploit Code Maturity (E)",
    RL: "Remediation Level (RL)",
    RC: "Report Confidence (RC)",
    CR: "Confidentiality Requirement (CR)",
    IR: "Integrity Requirement (IR)",
    AR: "Availability Requirement (AR)",
    MAV: "Modified Attack Vector (MAV)",
    MAC: "Modified Attack Complexity (MAC)",
    MPR: "Modified Privileges Required (MPR)",
    MUI: "Modified User Interaction (MUI)",
    MS: "Modified Scope (MS)",
    MC: "Modified Confidentiality (MC)",
    MI: "Modified Integrity (MI)",
    MA: "Modified Availability (MA)",
  };

  const bm = {
    AV: { N: "Network", A: "Adjacent Network", L: "Local", P: "Physical" },
    AC: { L: "Low", H: "High" },
    PR: { N: "None", L: "Low", H: "High" },
    UI: { N: "None", R: "Required" },
    S: { U: "Unchanged", C: "Changed" },
    C: { N: "None", L: "Low", H: "High" },
    I: { N: "None", L: "Low", H: "High" },
    A: { N: "None", L: "Low", H: "High" },
    E: { X: "Not Defined", U: "Unproven", P: "Proof of Concept", F: "Functional", H: "High" },
    RL: { X: "Not Defined", O: "Official Fix", T: "Temporary Fix", W: "Workaround", U: "Unavailable" },
    RC: { X: "Not Defined", U: "Unknown", R: "Reasonable", C: "Confirmed" },
    CR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    IR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    AR: { X: "Not Defined", L: "Low", M: "Medium", H: "High" },
    MAV: { X: "Not Defined", N: "Network", A: "Adjacent Network", L: "Local", P: "Physical" },
    MAC: { X: "Not Defined", L: "Low", H: "High" },
    MPR: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    MUI: { X: "Not Defined", N: "None", R: "Required" },
    MS: { X: "Not Defined", U: "Unchanged", C: "Changed" },
    MC: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    MI: { X: "Not Defined", N: "None", L: "Low", H: "High" },
    MA: { X: "Not Defined", N: "None", L: "Low", H: "High" },
  };

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    AV: "N",
    AC: "L",
    PR: "N",
    UI: "N",
    S: "U",
    C: "N",
    I: "N",
    A: "N",
    E: "X",
    RL: "X",
    RC: "X",
    CR: "X",
    IR: "X",
    AR: "X",
    MAV: "X",
    MAC: "X",
    MPR: "X",
    MUI: "X",
    MS: "X",
    MC: "X",
    MI: "X",
    MA: "X",
  });

  const [cvssInfo, setCvssInfo] = useState({
    baseScore: 0,
    temporalScore: 0,
    envScore: 0,
    severity: "None",
    vector: "",
  });

  const handleChange = (key: string, value: string) => {
    setSelectedValues(prev => {
      const updatedValues = { ...prev, [key]: value };
      calculateCVSS(updatedValues);
      return updatedValues;
    });
  };

  const calculateCVSS = (metrics: Record<string, string>) => {
    const cvssCalculator = new CVSS31();

    // Set the selected metrics in the CVSS31 instance
    Object.keys(metrics).forEach(key => {
      cvssCalculator.Set(key, metrics[key]);
    });

    const baseScore = cvssCalculator.BaseScore();
    const temporalScore = cvssCalculator.TemporalScore();
    const envScore = cvssCalculator.EnvironmentalScore();
    const severity = getSeverity(baseScore);
    const vector = generateVector(metrics);

    setCvssInfo({
      baseScore,
      temporalScore,
      envScore,
      severity,
      vector,
    });
  };

  const getSeverity = (score: number): string => {
    if (score === 0) return "None";
    if (score <= 3.9) return "Low";
    if (score <= 6.9) return "Medium";
    if (score <= 8.9) return "High";
    return "Critical";
  };

  const generateVector = (metrics: Record<string, string>) => {
    const baseMetrics = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"];
    const temporalMetrics = ["E", "RL", "RC"];
    const environmentalMetrics = ["CR", "IR", "AR", "MAV", "MAC", "MPR", "MUI", "MS", "MC", "MI", "MA"];

    const includeTemporal = temporalMetrics.some(key => metrics[key] !== "X");
    const includeEnvironmental = environmentalMetrics.some(key => metrics[key] !== "X");

    const vectorParts = [
      ...baseMetrics.map(key => `${key}:${metrics[key]}`),
      ...(includeTemporal ? temporalMetrics.map(key => `${key}:${metrics[key]}`) : []),
      ...(includeEnvironmental ? environmentalMetrics.map(key => `${key}:${metrics[key]}`) : []),
    ];

    return vectorParts.join("/");
  };

  return (
    <div>
      <form>
        {Object.keys(bg).map(key => (
          <Buttons key={key} label={bg[key]}>
            {Object.keys(bm[key]).map(optionKey => (
              <Button
                key={optionKey}
                color={selectedValues[key] === optionKey ? "success" : "contrast"}
                label={`${bm[key][optionKey]} (${optionKey})`}
                onClick={() => handleChange(key, optionKey)}
                small
              />
            ))}
          </Buttons>
        ))}
        <div>
          <ScoreBar score={cvssInfo.baseScore} />
          <p>Base Score: {cvssInfo.baseScore}</p>
          <p>Temporal Score: {cvssInfo.temporalScore}</p>
          <p>Environmental Score: {cvssInfo.envScore}</p>
          <p>Severity: {cvssInfo.severity}</p>
          <p>Vector: {cvssInfo.vector}</p>
        </div>
      </form>
    </div>
  );
};

export default CVSSCalculator;
