import { mdiCogs, mdiDownload, mdiPencil, mdiPlus, mdiShapePlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Table from "../components/Composition/Table";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import UploadFile from "../components/Form/UploadFile";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";
import { Category } from "../types/common.types";

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalManageActive, setIsModalManageActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [fileObj, setFileObj] = useState<File | null>(null);
  const [overrideExisting, setOverrideExisting] = useState(false);

  useEffect(() => {
    document.title = getPageTitle("Categories");
    fetchCategories();
  }, []);

  function fetchCategories() {
    getData<Category[]>("/api/categories", setCategories);
  }

  const changeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;
    setFileObj(files[0]);
  };

  const clearFile = () => {
    setFileObj(null);
  };

  // Delete single category
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteData<{ message: string }>(`/api/admin/categories/${categoryToDelete.id}`, () => {
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setIsModalTrashActive(false);
      setCategoryToDelete(null);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    });
  };

  // Export categories file
  const handleExport = () => {
    const url = "/api/admin/categories?download=true";
    const link = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload categories file
  const handleUploadCategories = () => {
    if (!fileObj) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("categories", fileObj);
    formData.append("override", overrideExisting ? "true" : "false");

    postData<{ message: string }>("/api/admin/categories/upload", formData, () => {
      toast.success("Categories uploaded successfully");
      setIsModalManageActive(false);
      setFileObj(null);
      fetchCategories();
    });
  };

  const handleModalManageConfirm = () => {
    handleUploadCategories();
  };

  const handleModalTrashConfirm = () => {
    confirmDeleteCategory();
  };

  return (
    <div>
      {/* Delete single category modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalTrashConfirm}
        onCancel={() => {
          setIsModalTrashActive(false);
          setCategoryToDelete(null);
        }}
      >
        <p>
          Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong>?
        </p>
      </Modal>

      {/* Manage categories modal */}
      <Modal
        title="Categories management"
        buttonLabel="Upload"
        isActive={isModalManageActive}
        onConfirm={handleModalManageConfirm}
        onCancel={() => setIsModalManageActive(false)}
      >
        <Grid className="gap-4">
          <Buttons>
            <Button icon={mdiDownload} text="Export categories" small onClick={handleExport} />
          </Buttons>
          <Divider />
          <UploadFile
            inputId="imported_categories"
            filename={fileObj?.name}
            name="categories"
            accept="application/json"
            onChange={changeFile}
            onButtonClick={clearFile}
          />
          <Checkbox
            id="override_categories"
            label="Override existing categories"
            checked={overrideExisting}
            onChange={e => setOverrideExisting(e.target.checked)}
          />
        </Grid>
      </Modal>

      <SectionTitleLineWithButton icon={mdiShapePlus} title="Categories">
        <Buttons>
          <Button icon={mdiPlus} text="New category" small onClick={() => navigate("/manage_category")} />
          <Button icon={mdiCogs} text="Categories management" small onClick={() => setIsModalManageActive(true)} />
        </Buttons>
      </SectionTitleLineWithButton>

      <div>
        <Table
          data={categories.map(category => ({
            Identifier: category.index,
            Name: category.name,
            Source: category.source.replace(/\b\w/g, char => char.toUpperCase()),
            Languages: Object.keys(category.generic_description || {})
              .join(" | ")
              .toUpperCase(),
            buttons: (
              <Buttons noWrap key={category.id}>
                <Button icon={mdiPencil} small onClick={() => navigate(`/manage_category/${category.id}`)} />
                <Button
                  variant="danger"
                  icon={mdiTrashCan}
                  small
                  onClick={() => {
                    setCategoryToDelete(category);
                    setIsModalTrashActive(true);
                  }}
                />
              </Buttons>
            ),
          }))}
          perPageCustom={50}
        />
      </div>
    </div>
  );
}
