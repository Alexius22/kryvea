import { mdiPencil, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
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
import { categories } from "../mockup_data/categories";
import { Category } from "../types/common.types";

const Categories = () => {
  const navigate = useNavigate();
  // const { data: categories, loading, error } = useFetch<Category[]>("/api/categories");
  const loading = false;
  const error = false;

  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Categories");
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
        <p>Are you sure to delete this vulnerability?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiTabSearch} title="Categories">
          <Button
            icon={mdiPlus}
            label="New category"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/manage_category")}
          />
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={categories.map(category => ({
                Identifier: category.index,
                Name: category.name,
                Source: category.source,
                Language: category.language,
              }))}
              buttons={
                <td className="whitespace-nowrap before:hidden lg:w-1">
                  <Buttons type="justify-start lg:justify-end" noWrap>
                    <Button color="info" icon={mdiPencil} small onClick={() => navigate("/manage_category")} />
                    <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                  </Buttons>
                </td>
              }
              perPageCustom={50}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Categories;
