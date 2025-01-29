import { mdiDotsCircle, mdiHistory } from "@mdi/js";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { assessments } from "../mockup_data/assessments";
import { Assessment } from "../types/common.types";

export default function Dashboard() {
  const navigate = useNavigate();
  //const { data: assessments, loading, error } = useFetch<Assessment[]>("/assessment");
  const loading = false;
  const error = false;

  useEffect(() => {
    document.title = getPageTitle("Dashboard");
  }, []);

  return (
    <>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiDotsCircle} title="Activity in progress" />
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={assessments.map(assessment => ({
                Customer: (
                  <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => navigate(`/assessments/${assessment.id}`)}
                  >
                    {assessment.name}
                  </span>
                ),
                "Assessment Name": assessment.name,
                "Assessment Type": assessment.type,
                //"Vulnerability Count": 4,
                Start: assessment.start_date_time,
                End: assessment.end_date_time,
                Status: assessment.status,
              }))}
              perPageCustom={10}
            />
          )}
        </CardBox>
      </SectionMain>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiHistory} title="Activities history" />
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={assessments.map(assessment => ({
                Customer: (
                  <span className="cursor-pointer hover:text-blue-500 hover:underline" onClick={() => {}}>
                    {assessment.name}
                  </span>
                ),
                "Assessment Name": assessment.name,
                "Assessment Type": assessment.type,
                //"Vulnerability Count": 4,
                Start: assessment.start_date_time,
                End: assessment.end_date_time,
                Status: assessment.status,
              }))}
              perPageCustom={10}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
}
