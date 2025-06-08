import { mdiTabSearch } from "@mdi/js";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import CardBox from "../components/CardBox/CardBox";
import { formatDate } from "../components/DateUtils";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { vulnerabilities } from "../mockup_data/vulnerabilities";

const Vulnerabilities = () => {
  const navigate = useNavigate();
  //const { data: vulnerabilities, loading, error } = useFetch<Vulnerability[]>("/api/vulnerabilities/search");
  const loading = false;
  const error = false;

  useEffect(() => {
    document.title = getPageTitle("Vulnerabilities");
  }, []);

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiTabSearch} title="Vulnerabilities" />
      <CardBox className="!p-0">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={vulnerabilities?.map(vulnerability => ({
              Vulnerability: (
                <span
                  onClick={() => navigate(`/vulnerability`)} // /api/vulnerability/${id}
                >
                  {vulnerability.category.name + " - " + vulnerability.detailed_title}
                </span>
              ),
              "CVSS Score": vulnerability.cvss_score,
              "CVSS Vector": vulnerability.cvss_vector,
              Assessment: <span onClick={() => navigate(`/assessment`)}>{vulnerability.assessment.name}</span>,
              Date: formatDate(vulnerability.updated_at),
              User: vulnerability.user.username,
            }))}
            perPageCustom={10}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Vulnerabilities;
