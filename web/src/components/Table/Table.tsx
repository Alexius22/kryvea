import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import Button from "../Button";
import Buttons from "../Buttons";
import CardBoxModal from "../CardBox/Modal";
import FormField from "../Form/Field";
import Icon from "../Icon/Icon";

const Table = ({ data, buttons, perPageCustom }: { data; buttons?; perPageCustom }) => {
  const [originalData] = useState([...data]);
  const [perPage, setPerPage] = useState(perPageCustom);
  const [currentPage, setCurrentPage] = useState(0);
  const [keySort, setKeySort] = useState<{ header: string; order: 1 | 2 }>();

  const sortAscend = (a, b) => {
    if (a[keySort.header] > b[keySort.header]) return 1;
    if (a[keySort.header] < b[keySort.header]) return -1;
    return 0;
  };
  const sortDescend = (a, b) => {
    if (a[keySort.header] < b[keySort.header]) return 1;
    if (a[keySort.header] > b[keySort.header]) return -1;
    return 0;
  };

  const itemPaginated = (arr: any[]) => {
    switch (keySort?.order) {
      case 1:
        arr = arr.sort(sortAscend);
        break;
      case 2:
        arr = arr.sort(sortDescend);
        break;
      case undefined:
        arr = originalData; // reset to original order
        break;
      default:
        console.warn("keySort unknown value = ", keySort);
    }
    return arr.slice(perPage * currentPage, perPage * (currentPage + 1));
  };
  const numPages = Math.ceil(data.length / perPage);
  const pagesList = [];

  for (let i = 0; i < numPages; i++) {
    pagesList.push(i);
  }

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  const onHeaderClick = key => () => {
    setKeySort(prev => {
      if (prev === undefined || prev.header !== key) {
        return { header: key, order: 1 };
      }
      if (prev.header === key && prev.order === 1) {
        return { header: key, order: 2 };
      }
      return undefined;
    });
  };

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
        <p>Are you sure to delete this user?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>

      <table>
        <thead>
          <tr>
            {data.length === 0 ? (
              <th>empty</th>
            ) : (
              Object.keys(data[0]).map(key => (
                <th className="cursor-pointer align-middle hover:opacity-60" onClick={onHeaderClick(key)}>
                  {key}
                  <Icon
                    className={keySort === undefined ? "opacity-0" : keySort.header !== key ? "opacity-0" : ""}
                    h="h-min"
                    w="w-min"
                    path={keySort?.order === 1 ? mdiChevronDown : mdiChevronUp}
                  />
                </th>
              ))
            )}
            {buttons == undefined ? <></> : <th />}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td>empty</td>
            </tr>
          ) : (
            itemPaginated(data).map(obj => (
              <tr>
                {Object.entries<any>(obj).map(([key, value]) => (
                  <td>{value}</td>
                ))}
                {buttons && buttons}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="border-t border-gray-100 p-3 dark:border-slate-800 lg:px-6">
        <div className="flex flex-col items-center justify-between py-3 md:flex-row md:py-0">
          <Buttons>
            {pagesList.map(page => (
              <Button
                key={page}
                active={page === currentPage}
                label={page + 1}
                color={page === currentPage ? "lightDark" : "whiteDark"}
                small
                onClick={() => setCurrentPage(page)}
              />
            ))}
          </Buttons>
          <Formik initialValues={undefined} onSubmit={undefined}>
            <Form className="ml-auto mr-2 w-20">
              <FormField noHeight>
                <Field type="number" value={perPage} onChange={val => setPerPage(+val.target.value)} />
              </FormField>
            </Form>
          </Formik>
          <small className="mt-6 md:mt-0">
            Page {currentPage + 1} of {numPages}
          </small>
        </div>
      </div>
    </>
  );
};

export default Table;
