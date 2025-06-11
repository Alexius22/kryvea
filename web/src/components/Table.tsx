import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { isValidElement, useEffect, useState } from "react";
import Card from "./CardBox/Card";
import Button from "./Form/Button";
import Buttons from "./Form/Buttons";
import Input from "./Form/Input";
import Icon from "./Icon";

const Table = ({
  data,
  perPageCustom,
  wMin,
  minW = "min-w-max",
}: {
  data: any[];
  perPageCustom;
  wMin?: true;
  minW?: "min-w-fit" | "min-w-max";
}) => {
  const [perPage, setPerPage] = useState(perPageCustom);
  const [currentPage, setCurrentPage] = useState(0);
  const [keySort, setKeySort] = useState<{ header: string; order: 1 | 2 }>();
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(
      data.filter(obj => {
        return Object.entries(obj)
          .filter(([key]) => key !== "buttons")
          .some(([_, value]) => {
            if (isValidElement(value)) {
              value = (value as any).props.children;
            }
            return value?.toString().toLowerCase().includes(filterText.toLowerCase());
          });
      })
    );
  }, [filterText, data]);

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
    console.log("onHeaderClick", keySort?.order);
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
    <Card className={`!p-0 ${minW} ${wMin ? "w-min" : ""}`}>
      <Input
        className="rounded-t-2xl bg-transparent focus:border-none focus:ring-0"
        placeholder="Search"
        type="text"
        value={filterText}
        onChange={e => {
          setCurrentPage(0);
          setFilterText(e.target.value);
        }}
      />
      <table>
        {filteredData.length > 0 && (
          <thead>
            <tr>
              {Object.keys(filteredData[0]).map((key, i, arr) =>
                key === "buttons" ? (
                  <th
                    style={{
                      width: "1%",
                      whiteSpace: "nowrap",
                    }}
                    key={`header-${key}`}
                  />
                ) : (
                  <th
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
                )
              )}
            </tr>
          </thead>
        )}
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={Object.keys(filteredData[0] ?? {}).length} className="text-center">
                No results available
              </td>
            </tr>
          ) : (
            itemPaginated(filteredData).map((obj, i) => (
              <tr key={`row-${i}`}>
                {Object.entries<any>(obj).map(([key, value]) =>
                  key == "buttons" ? (
                    <td className="py-0" key={`${key}-value-${i}`}>
                      {value}
                    </td>
                  ) : (
                    <td key={`${key}-value-${i}`}>{value}</td>
                  )
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-3 lg:px-6">
        <div className="flex flex-col items-center justify-between py-3 md:flex-row md:py-0">
          <Buttons>
            {pagesList.map(page => (
              <Button
                key={page}
                small
                text={page + 1}
                className="border-hidden"
                disabled={page === currentPage}
                onClick={() => setCurrentPage(page)}
              />
            ))}
          </Buttons>
          <input
            type="number"
            className="ml-auto mr-2 h-8 w-[50px] rounded-md text-center"
            value={perPage}
            onChange={e => setPerPage(+e.target.value)}
          />
          <small className="mt-6 md:mt-0">
            Page {currentPage + 1} of {numPages}
          </small>
        </div>
      </div>
    </Card>
  );
};

export default Table;
