import React, { createContext, useContext, useState } from "react";

const CVSSContext = createContext(null);

export const CVSSProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedValues, setSelectedValues] = useState({
    AttackVector: "N",
    AttackComplexity: "L",
    PrivilegesRequired: "N",
    UserInteraction: "N",
    Scope: "U",
    Confidentiality: "N",
    Integrity: "N",
    Availability: "N",
    ExploitCodeMaturity: "X",
    RemediationLevel: "X",
    ReportConfidence: "X",
    ConfidentialityRequirement: "X",
    IntegrityRequirement: "X",
    AvailabilityRequirement: "X",
    ModifiedAttackVector: "X",
    ModifiedAttackComplexity: "X",
    ModifiedPrivilegesRequired: "X",
    ModifiedUserInteraction: "X",
    ModifiedScope: "X",
    ModifiedConfidentiality: "X",
    ModifiedIntegrity: "X",
    ModifiedAvailability: "X",
  });

  for (const key in selectedValues) {
    if (selectedValues[key] === undefined) {
      selectedValues[key] = "X";
    }
  }

  return <CVSSContext.Provider value={{ selectedValues, setSelectedValues }}>{children}</CVSSContext.Provider>;
};

export const CVSS3Context = () => useContext(CVSSContext);
