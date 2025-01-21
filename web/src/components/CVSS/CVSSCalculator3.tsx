import { useState } from "react";

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

  const renderDropdown = () => {
    return (
      <div className="cvss-dropdown">
        <form onSubmit={handleSubmit}>
          {Object.keys(bg).map(group => (
            <div key={group}>
              <h3>{bg[group]}</h3>
              {Object.keys(bm[group]).map(value => (
                <label key={value}>
                  <input
                    type="radio"
                    name={group}
                    value={value}
                    checked={selectedValues[group] === value}
                    onChange={() => handleChange(group, value)}
                  />
                  {bm[group][value]}
                </label>
              ))}
            </div>
          ))}
          <div className="submit-section">
            <button type="submit">Submit</button>
            <button type="button" onClick={handleModifyDropdown}>
              Modify Selections
            </button>
          </div>
        </form>
      </div>
    );
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

  return <div>{dropdownOpen ? renderDropdown() : renderResults()}</div>;
};

export default CVSSCalculator3;
