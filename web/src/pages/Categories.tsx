import { mdiPencil, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { categories } from "../mockup_data/categories";

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
    <div>
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
      <CardBox noPadding>
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
              Languages: Object.keys(category.generic_description || {})
                .join(" | ")
                .toUpperCase(),
              buttons: (
                <Buttons noWrap>
                  <Button color="info" icon={mdiPencil} small onClick={() => navigate("/manage_category")} />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={50}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Categories;
