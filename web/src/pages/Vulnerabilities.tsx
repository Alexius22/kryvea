import { mdiTabSearch } from "@mdi/js";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { vulnerabilities } from "../mockup_data/vulnerabilities";
import { Vulnerability } from "../types/common.types";

const Vulnerabilities = () => {
  const navigate = useNavigate();
  //const { data: vulnerabilities, loading, error } = useFetch<Vulnerability[]>("/api/vulnerabilities/search");
  const loading = false;
  const error = false;

  useEffect(() => {
    document.title = getPageTitle("Vulnerabilities");
  }, []);

  return (
    <SectionMain>
      <SectionTitleLineWithButton icon={mdiTabSearch} title="Vulnerabilities" />
      <CardBox hasTable>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={vulnerabilities?.map(vulnerability => ({
              Vulnerability: (
                <span
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => navigate(`/vulnerability`)} // /api/vulnerability/${id}
                >
                  {vulnerability.detailed_title}
                </span>
              ),
              "CVSS score": vulnerability.cvss_score,
              "CVSS Vector": vulnerability.cvss_vector,
              Assessment: vulnerability.assessment_id,
              Host: vulnerability.target_id,
            }))}
            perPageCustom={10}
          />
        )}
      </CardBox>
    </SectionMain>
  );
};

export default Vulnerabilities;
