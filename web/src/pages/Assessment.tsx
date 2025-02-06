import { mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { vulnerabilities } from "../mockup_data/vulnerabilities";
import { Vulnerability } from "../types/common.types";

const Assessment = () => {
  const navigate = useNavigate();
  // const { data: vulnerabilities, loading, error } = useFetch<Vulnerability[]>("/api/vulnerabilities");
  const loading = false;
  const error = false;

  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalTrashActive(false);
  };
  useEffect(() => {
    document.title = getPageTitle("Assessment");
  }, []);

  return (
    <>
      <CardBoxModal
        title="Please confirm"
        buttonColor="danger"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure to delete this assessment?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>

      <SectionMain>
        <SectionTitleLineWithButton icon={mdiListBox} title="Assessment">
          <Buttons>
            <Button
              icon={mdiPlus}
              label="New host"
              roundedFull
              small
              color="contrast"
              onClick={() => navigate("/add_host")}
            />
            <Button
              icon={mdiPlus}
              label="New vulnerability"
              roundedFull
              small
              color="contrast"
              onClick={() => navigate("/add_vulnerability")}
            />
          </Buttons>
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={vulnerabilities.map(vulnerability => ({
                Vulnerability: (
                  <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => navigate(`/vulnerability`)}
                  >
                    {vulnerability.category_id} ({vulnerability.detailed_title})
                  </span>
                ),
                Host: vulnerability.target_id,
                "CVSS Score": vulnerability.cvss_score,
                buttons: (
                  <td className="whitespace-nowrap before:hidden lg:w-1">
                    <Buttons type="justify-start lg:justify-end" noWrap>
                      <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                    </Buttons>
                  </td>
                ),
              }))}
              perPageCustom={10}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Assessment;
