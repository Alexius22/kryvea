import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { getData } from "../api/api";
import { GlobalContext } from "../App";
import { formatDate } from "../components/dateUtils";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Assessment } from "../types/common.types";

export default function Dashboard() {
  const {
    useCtxCustomer: [, setCtxCustomer],
  } = useContext(GlobalContext);

  const [assessmentsData, setAssessmentsData] = useState<Assessment[]>([]);

  useEffect(() => {
    document.title = getPageTitle("Dashboard");
    getData<Assessment[]>("/api/assessments/owned", setAssessmentsData);
  }, []);

  const renderTable = (title: string, icon: string, assessments: Assessment[]) => (
    <div>
      <SectionTitleLineWithButton icon={icon} title={title} />
      <Table
        data={assessments.map(assessment => ({
          Customer: (
            <Link
              to={`/customers/${assessment.customer.id}`}
              onClick={e => {
                setCtxCustomer(assessment.customer);
              }}
            >
              {assessment.customer.name}
            </Link>
          ),
          "Assessment Name": (
            <Link to={`/customers/${assessment.customer.id}/assessments/${assessment.id}/vulnerabilities`}>
              {assessment.name}
            </Link>
          ),
          "Assessment Type": assessment.assessment_type,
          "Vulnerability Count": assessment.vulnerability_count,
          Start: formatDate(assessment.start_date_time),
          End: formatDate(assessment.end_date_time),
          Status: assessment.status,
        }))}
        perPageCustom={10}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {renderTable(
        "Ongoing Assessments",
        mdiDotsCircle,
        assessmentsData.filter(a => a.status !== "Completed")
      )}
      {renderTable(
        "Completed Assessments",
        mdiHistory,
        assessmentsData.filter(a => a.status === "Completed")
      )}
    </div>
  );
}
