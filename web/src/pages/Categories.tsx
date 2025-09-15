import { mdiDownload, mdiPencil, mdiPlus, mdiShapePlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, postData } from "../api/api";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import UploadFile from "../components/Form/UploadFile";
import { Category } from "../types/common.types";
import { getPageTitle } from "../utils/helpers";
import { sourceCategoryOptions } from "./CategoryUpsert";

const sourceCategoryMap = Object.fromEntries(sourceCategoryOptions.map(({ value, label }) => [value, label]));

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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
    setLoadingCategories(true);
    getData<Category[]>("/api/categories", setCategories, undefined, () => setLoadingCategories(false));
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
    const url = "/api/admin/categories/export";
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
      {isModalTrashActive && (
        <Modal
          title="Please confirm: action irreversible"
          confirmButtonLabel="Confirm"
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
      )}

      {/* Upload categories */}
      {isModalManageActive && (
        <Modal
          title="Upload categories"
          confirmButtonLabel="Upload"
          onConfirm={handleModalManageConfirm}
          onCancel={() => setIsModalManageActive(false)}
        >
          <Grid className="gap-4">
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
      )}

      <PageHeader icon={mdiShapePlus} title="Categories">
        <Buttons>
          <Button icon={mdiPlus} text="New category" small onClick={() => navigate("new")} />
          <Button icon={mdiUpload} text="Upload categories" small onClick={() => setIsModalManageActive(true)} />
          <Button icon={mdiDownload} text="Export categories" small onClick={handleExport} />
        </Buttons>
      </PageHeader>

      <div>
        <Table
          loading={loadingCategories}
          data={categories.map(category => ({
            Identifier: category.index,
            Name: category.name,
            Source: sourceCategoryMap[category.source],
            Languages: Object.keys(category.generic_description || {})
              .join(" | ")
              .toUpperCase(),
            buttons: (
              <Buttons noWrap key={category.id}>
                <Button icon={mdiPencil} small onClick={() => navigate(`${category.id}`)} />
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
