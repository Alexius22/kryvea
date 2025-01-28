import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { isValidElement, useEffect, useState } from "react";
import Button from "../Button";
import Buttons from "../Buttons";
import FormField from "../Form/Field";
import Icon from "../Icon/Icon";
import CardBox from "../CardBox";

const Table = ({ data, buttons, perPageCustom }: { data: any[]; buttons?; perPageCustom }) => {
  const [perPage, setPerPage] = useState(perPageCustom);
  const [currentPage, setCurrentPage] = useState(0);
  const [keySort, setKeySort] = useState<{ header: string; order: 1 | 2 }>();
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setCurrentPage(0);
    setFilteredData(
      data.filter(obj => {
        return Object.values(obj).some(value => {
          if (isValidElement(value)) {
            value = (value as any).props.children;
          }
          return value.toString().toLowerCase().includes(filterText.toLowerCase());
        });
      })
    );
  }, [filterText]);

  const sortAscend = (a, b) => {
    a = a[keySort.header];
    b = b[keySort.header];
    if (isValidElement(a)) {
      a = (a as any).props.children;
      b = (b as any).props.children;
    }
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
  const sortDescend = (a, b) => {
    a = a[keySort.header];
    b = b[keySort.header];
    if (isValidElement(a)) {
      a = (a as any).props.children;
      b = (b as any).props.children;
    }
    if (a < b) return 1;
    if (a > b) return -1;
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
        arr = filteredData; // reset to original order
        break;
      default:
        console.warn("keySort unknown value = ", keySort);
    }

    return arr.slice(perPage * currentPage, perPage * (currentPage + 1));
  };

  const numPages = Math.ceil(filteredData.length / perPage);
  const pagesList = [];

  for (let i = 0; i < numPages; i++) {
    pagesList.push(i);
  }

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
      <input
        className="mb-2 h-10 w-80 rounded-lg border-0 bg-slate-900/50"
        placeholder="Search"
        type="text"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />
      <CardBox hasTable>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              {filteredData.length === 0 ? (
                <th>empty</th>
              ) : (
                Object.keys(filteredData[0]).map((key, i, arr) => {
                  return (
                    <th
                      style={{
                        width: `${100 / arr.length}%`,
                      }}
                      className="cursor-pointer align-middle hover:opacity-60"
                      onClick={onHeaderClick(key)}
                      key={`header-${key}`}
                    >
                      {key}
                      <Icon
                        className={keySort === undefined ? "opacity-0" : keySort.header !== key ? "opacity-0" : ""}
                        h="h-min"
                        w="w-min"
                        path={keySort?.order === 1 ? mdiChevronDown : mdiChevronUp}
                      />
                    </th>
                  );
                })
              )}
              {buttons == undefined ? <></> : <th className="w-min" />}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td>empty</td>
              </tr>
            ) : (
              itemPaginated(filteredData).map((obj, i) => (
                <tr key={`row-${i}`}>
                  {Object.entries<any>(obj).map(([key, value]) => (
                    <td key={`${key}-value-${i}`}>{value}</td>
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
      </CardBox>
    </>
  );
};

export default Table;
