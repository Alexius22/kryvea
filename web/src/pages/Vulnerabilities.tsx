import { mdiTabSearch } from "@mdi/js";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Card from "../components/CardBox/Card";
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
      <Card className="!p-0">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={vulnerabilities?.map(vulnerability => ({
              Vulnerability: (
                <Link to={`/vulnerability`}>{vulnerability.category.name + " - " + vulnerability.detailed_title}</Link>
              ),
              Description: vulnerability.description,
              "CVSSv3.1 Score": vulnerability.cvss_score,
              "CVSSv4.0 Score": vulnerability.cvss_score,
              Assessment: <Link to={`/assessment`}>{vulnerability.assessment.name}</Link>,
              Date: formatDate(vulnerability.updated_at),
              User: vulnerability.user.username,
            }))}
            perPageCustom={10}
            maxWidthColumns={{ Description: "20rem" }}
          />
        )}
      </Card>
    </div>
  );
};

export default Vulnerabilities;
