import { useState } from "react";
import Buttons from "../Buttons";
import Button from "../Button";
import ScoreBar from "./ScoreBar";

const CVSSCalculator3 = ({ onChange, onSubmit }) => {
  const [selectedValues, setSelectedValues] = useState({
    AV: null,
    AC: null,
    PR: null,
    UI: null,
    S: null,
    C: null,
    I: null,
    A: null,
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
  };

  const handleChange = (group, value) => {
    const newSelectedValues = { ...selectedValues, [group]: value };
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

  const renderResults = () => {
    const cvssScore = calculateCVSS(selectedValues);
    return (
      <div className="cvss-results">
        <p>CVSS Score: {cvssScore}</p>
        <p>Vector: {generateVector(selectedValues)}</p>
        <button onClick={handleModifyDropdown}>Modify Selections</button>
      </div>
    );
  };

  const calculateCVSS = selectedValues => {
    const score = Object.values(selectedValues).filter(value => value).length;
    return score;
  };

  const generateVector = selectedValues => {
    return `CVSS:3.1/AV:${selectedValues.AV}/AC:${selectedValues.AC}/PR:${selectedValues.PR}/UI:${selectedValues.UI}/S:${selectedValues.S}/C:${selectedValues.C}/I:${selectedValues.I}/A:${selectedValues.A}`;
  };

  return (
    <div>
      <p className="mb-2 font-bold">Attack Vector (AV)</p>
      <Buttons>
        <Button color="contrast" label="Network (N)" onClick={() => handleChange("AV", "N")} />
        <Button color="contrast" label="Adjacent (A)" onClick={() => handleChange("AV", "A")} />
        <Button color="contrast" label="Local (L)" onClick={() => handleChange("AV", "L")} />
        <Button color="contrast" label="Physical (P)" onClick={() => handleChange("AV", "P")} />
      </Buttons>
      <p className="my-2 font-bold">Attack Complexity (AC)</p>
      <Buttons>
        <Button color="contrast" label="Low (L)" onClick={() => handleChange("AC", "L")} />
        <Button color="contrast" label="High (H)" onClick={() => handleChange("AC", "H")} />
      </Buttons>
      <p className="my-2 font-bold">Privileges Required (PR)</p>
      <Buttons>
        <Button color="contrast" label="None (N)" onClick={() => handleChange("PR", "N")} />
        <Button color="contrast" label="Low (L)" onClick={() => handleChange("PR", "L")} />
        <Button color="contrast" label="High (H)" onClick={() => handleChange("PR", "H")} />
      </Buttons>
      <p className="my-2 font-bold">User Interaction (UI)</p>
      <Buttons>
        <Button color="contrast" label="None (N)" onClick={() => handleChange("UI", "N")} />
        <Button color="contrast" label="Required (R)" onClick={() => handleChange("UI", "R")} />
      </Buttons>
      <p className="my-2 font-bold">Scope (S)</p>
      <Buttons>
        <Button color="contrast" label="Unchanged (U)" onClick={() => handleChange("S", "U")} />
        <Button color="contrast" label="Changed (C)" onClick={() => handleChange("S", "C")} />
      </Buttons>
      <p className="my-2 font-bold">Confidentiality (C)</p>
      <Buttons>
        <Button color="contrast" label="None (N)" onClick={() => handleChange("C", "N")} />
        <Button color="contrast" label="Low (L)" onClick={() => handleChange("C", "L")} />
        <Button color="contrast" label="High (H)" onClick={() => handleChange("C", "H")} />
      </Buttons>
      <p className="my-2 font-bold">Integrity (I)</p>
      <Buttons>
        <Button color="contrast" label="None (N)" onClick={() => handleChange("I", "N")} />
        <Button color="contrast" label="Low (L)" onClick={() => handleChange("I", "L")} />
        <Button color="contrast" label="High (H)" onClick={() => handleChange("I", "H")} />
      </Buttons>
      <p className="my-2 font-bold">Availability (A)</p>
      <Buttons>
        <Button color="contrast" label="None (N)" onClick={() => handleChange("A", "N")} />
        <Button color="contrast" label="Low (L)" onClick={() => handleChange("A", "L")} />
        <Button color="contrast" label="High (H)" onClick={() => handleChange("A", "H")} />
      </Buttons>
      <p className="my-2 font-bold">
        Score: <ScoreBar score={1} />
      </p>
      <p className="my-2 font-bold">Severity: </p>
    </div>
  );
};

export default CVSSCalculator3;
