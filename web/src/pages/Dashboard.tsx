import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../../App";
import CardBox from "../components/CardBox";
import { formatDate } from "../components/DateUtils";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { assessments } from "../mockup_data/assessments";
import { Assessment } from "../types/common.types";

export default function Dashboard() {
  const navigate = useNavigate();
  // const { data: assessments, loading, error } = useFetch<Assessment[]>("/assessment");
  const loading = false;
  const error = false;

  useEffect(() => {
    document.title = getPageTitle("Dashboard");
  }, []);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const renderTable = (title: string, icon: string, data: Partial<Assessment>[]) => (
    <div>
      <SectionTitleLineWithButton icon={icon} title={title} />
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={data.map(assessment => ({
              Customer: (
                <span
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => setCustomerName(assessment.customer.name)}
                >
                  {assessment.customer.name}
                </span>
              ),
              "Assessment Name": (
                <span
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => navigate(`/assessment`)}
                >
                  {assessment.name}
                </span>
              ),
              "Assessment Type": assessment.assessment_type,
              Start: formatDate(assessment.start_date_time),
              End: formatDate(assessment.end_date_time),
              Status: assessment.status,
            }))}
            perPageCustom={10}
          />
        )}
      </CardBox>
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
