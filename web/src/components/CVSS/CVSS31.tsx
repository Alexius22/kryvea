import { useState } from "react";

const metricValues = {
  AV: ["N", "A", "L", "P"],
  AC: ["L", "H"],
  PR: ["N", "L", "H"],
  UI: ["N", "R"],
  S: ["U", "C"],
  C: ["H", "L", "N"],
  I: ["H", "L", "N"],
  A: ["H", "L", "N"],
  E: ["X", "H", "F", "P", "U"],
  RL: ["X", "U", "W", "T", "O"],
  RC: ["X", "C", "R", "U"],
  CR: ["X", "H", "M", "L"],
  IR: ["X", "H", "M", "L"],
  AR: ["X", "H", "M", "L"],
  MAV: ["X", "N", "A", "L", "P"],
  MAC: ["X", "L", "H"],
  MPR: ["X", "N", "L", "H"],
  MUI: ["X", "N", "R"],
  MS: ["X", "U", "C"],
  MC: ["X", "H", "L", "N"],
  MI: ["X", "H", "L", "N"],
  MA: ["X", "H", "L", "N"],
};

const scores = {
  AV: {
    N: 0.85,
    A: 0.62,
    L: 0.55,
    P: 0.2,
  },
  AC: {
    L: 0.77,
    H: 0.44,
  },
  PR: {
    N: {
      U: 0.85,
      C: 0.85,
    },
    L: {
      U: 0.62,
      C: 0.68,
    },
    H: {
      U: 0.27,
      C: 0.5,
    },
  },
  UI: {
    N: 0.85,
    R: 0.62,
  },
  CIA: {
    H: 0.56,
    L: 0.22,
    N: 0,
  },
  E: {
    X: 1,
    H: 1,
    F: 0.97,
    P: 0.94,
    U: 0.91,
  },
  RL: {
    X: 1,
    U: 1,
    W: 0.97,
    T: 0.96,
    O: 0.95,
  },
  RC: {
    X: 1,
    C: 1,
    R: 0.96,
    U: 0.92,
  },
  CIAR: {
    X: 1,
    M: 1,
    H: 1.5,
    L: 0.5,
  },
};

export default class CVSS31 {
  private _metrics = {
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
  };

  Get(metric: string): string {
    const v = this._metrics[metric];
    if (v == undefined) {
      throw new Error(`Invalid Metric: ${metric}`);
    }
    return v;
  }

  Set(metric: string, value: string) {
    if (metricValues[metric] == undefined || !metricValues[metric].includes(value)) {
      throw new Error(`Invalid Metric Value: ${value} for ${metric}`);
    }
    this._metrics[metric] = value;
  }

  Impact(): number {
    const C = scores["CIA"][this._metrics["C"]];
    const I = scores["CIA"][this._metrics["I"]];
    const A = scores["CIA"][this._metrics["A"]];
    const ISS = 1 - (1 - C) * (1 - I) * (1 - A);
    if (this._metrics["S"] == "U") {
      return 6.42 * ISS;
    }
    return 7.52 * (ISS - 0.029) - 3.25 * (ISS - 0.02) ** 15;
  }

  Exploitability(): number {
    const AV = scores["AV"][this._metrics["AV"]];
    const AC = scores["AC"][this._metrics["AC"]];
    const PR = scores["PR"][this._metrics["PR"]][this._metrics["S"]];
    const UI = scores["UI"][this._metrics["UI"]];
    return 8.22 * AV * AC * PR * UI;
  }

  BaseScore(): number {
    const impact = this.Impact();
    const exploitability = this.Exploitability();
    if (impact <= 0) {
      return 0;
    }
    if (this._metrics["S"] == "U") {
      return this.roundup(Math.min(impact + exploitability, 10));
    }
    return this.roundup(Math.min(1.08 * (impact + exploitability), 10));
  }

  TemporalScore(): number {
    const E = scores["E"][this._metrics["E"]];
    const RL = scores["RL"][this._metrics["RL"]];
    const RC = scores["RC"][this._metrics["RC"]];
    return this.roundup(this.BaseScore() * E * RL * RC);
  }

  EnvironmentalScore(): number {
    const mAV = scores["AV"][this.getReal("AV")];
    const mAC = scores["AC"][this.getReal("AC")];
    const mPR = scores["PR"][this.getReal("PR")][this._metrics["S"]];
    const mUI = scores["UI"][this.getReal("UI")];
    const S = this.getReal("S");
    const C = scores["CIA"][this.getReal("C")];
    const I = scores["CIA"][this.getReal("I")];
    const A = scores["CIA"][this.getReal("A")];
    const CR = scores["CIAR"][this._metrics["CR"]];
    const IR = scores["CIAR"][this._metrics["IR"]];
    const AR = scores["CIAR"][this._metrics["AR"]];
    const E = scores["E"][this._metrics["E"]];
    const RL = scores["RL"][this._metrics["RL"]];
    const RC = scores["RC"][this._metrics["RC"]];

    const mISS = Math.min(1 - (1 - CR * C) * (1 - IR * I) * (1 - AR * A), 0.915);
    let modifiedImpact: number;
    if (S == "U") {
      modifiedImpact = 6.42 * mISS;
    } else {
      modifiedImpact = 7.52 * (mISS - 0.029) - 3.25 * (mISS * 0.9731 - 0.02) ** 13;
    }
    let modifiedExploitability = 8.22 * mAV * mAC * mPR * mUI;
    if (modifiedImpact <= 0) {
      return 0;
    }
    if (S == "U") {
      return this.roundup(this.roundup(Math.min(modifiedImpact + modifiedExploitability, 10)) * E * RL * RC);
    }
    return this.roundup(this.roundup(Math.min(1.08 * (modifiedImpact + modifiedExploitability), 10)) * E * RL * RC);
  }

  private getReal(metric: string): string {
    if (["AV", "AC", "PR", "UI", "S", "C", "I", "A"].includes(metric)) {
      const v = this.Get("M" + metric);
      if (v != "X") {
        return v;
      }
      return this.Get(metric);
    }
    return this.Get(metric);
  }

  private roundup = value => Math.ceil(value * 10) / 10;
}

const useCVSS31 = () => {
  const [metrics, setMetrics] = useState<CVSS31>(new CVSS31());

  const updateMetric = (metric: string, value: string) => {
    metrics.Set(metric, value);
    setMetrics(new CVSS31());
  };

  return {
    metrics,
    updateMetric,
    BaseScore: metrics.BaseScore(),
    TemporalScore: metrics.TemporalScore(),
    EnvironmentalScore: metrics.EnvironmentalScore(),
  };
};
