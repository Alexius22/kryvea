import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { GlobalContext } from "../App";
import { formatDate } from "../components/dateUtils";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { assessments } from "../mockup_data/assessments";
import { Assessment } from "../types/common.types";

export default function Dashboard() {
  const navigate = useNavigate();
  const loading = false;
  const error = false;

  useEffect(() => {
    document.title = getPageTitle("Dashboard");
  }, []);

  const {
    useCustomerName: [, setCustomerName],
    useCustomerId: [, setCustomerId],
  } = useContext(GlobalContext);

  const renderTable = (title: string, icon: string, data: Partial<Assessment>[]) => (
    <div>
      <SectionTitleLineWithButton icon={icon} title={title} />
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={data.map(assessment => ({
              Customer: (
                <Link
                  to=""
                  onClick={() => {
                    setCustomerName(assessment.customer.name);
                    setCustomerId(assessment.customer.id);
                  }}
                >
                  {assessment.customer.name}
                </Link>
              ),
              "Assessment Name": <Link to={`/assessment`}>{assessment.name}</Link>,
              "Assessment Type": assessment.assessment_type,
              Start: formatDate(assessment.start_date_time),
              End: formatDate(assessment.end_date_time),
              Status: assessment.status,
            }))}
            perPageCustom={10}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {renderTable(
        "Ongoing Assessments",
        mdiDotsCircle,
        assessments.filter(a => a.status !== "Completed")
      )}
      {renderTable(
        "Completed Assessments",
        mdiHistory,
        assessments.filter(a => a.status === "Completed")
      )}
    </div>
  );
}
