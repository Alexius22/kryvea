import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { isValidElement, useEffect, useMemo, useState } from "react";
import Card from "./CardBox/Card";
import Flex from "./Composition/Flex";
import Button from "./Form/Button";
import Buttons from "./Form/Buttons";
import Input from "./Form/Input";
import Icon from "./Icon";

export default function Table({
  data,
  perPageCustom = 5,
  wMin,
  minW = "min-w-max",
  maxWidthColumns = {},
}: {
  data: any[];
  perPageCustom?;
  wMin?: true;
  minW?: "min-w-fit" | "min-w-max";
  maxWidthColumns?: Record<string, string>;
}) {
  const [perPage, setPerPage] = useState(perPageCustom);
  const [perPagePreview, setPerPagePreview] = useState(perPageCustom);
  const [currentPage, setCurrentPage] = useState(0);
  const [keySort, setKeySort] = useState<{ header: string; order: 1 | 2 }>();
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState(data ?? []);

  useEffect(() => {
    setFilteredData(
      (data ?? []).filter(obj => {
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

  const numPages = useMemo(() => {
    const num = Math.ceil(filteredData.length / perPage);
    if (isNaN(num)) {
      return 0;
    }
    return num;
  }, [filteredData.length, perPage]);
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
    <Card className={`!p-0 ${minW} ${wMin ? "w-min" : ""}`}>
      <Input
        className="rounded-t-2xl bg-transparent p-4 focus:border-transparent"
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
              {Object.keys(filteredData[0]).map(key =>
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
                      path={keySort?.order === 1 ? mdiChevronDown : mdiChevronUp}
                      viewBox={"0 0 18 18"}
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
              <td
                colSpan={Object.keys(filteredData[0] ?? {}).length}
                className="border-t-[1px] border-[color:var(--border-primary)] text-center font-thin italic opacity-50"
              >
                No results available
              </td>
            </tr>
          ) : (
            itemPaginated(filteredData).map((obj, i) => (
              <tr key={`row-${i}`}>
                {Object.entries<any>(obj).map(([key, value]) => {
                  // If this column should have max-width and ellipsis
                  if (maxWidthColumns[key]) {
                    return (
                      <td key={`${key}-value-${i}`}>
                        <div
                          style={{
                            maxWidth: maxWidthColumns[key],
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={typeof value === "string" ? value : undefined}
                        >
                          {value}
                        </div>
                      </td>
                    );
                  }

                  // Default rendering
                  if (key === "buttons") {
                    return (
                      <td className="py-0" key={`${key}-value-${i}`}>
                        {value}
                      </td>
                    );
                  }

                  return <td key={`${key}-value-${i}`}>{value}</td>;
                })}
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
                variant={currentPage === page ? "" : "secondary"}
                key={page}
                small
                text={page + 1}
                disabled={page === currentPage}
                onClick={() => setCurrentPage(page)}
              />
            ))}
          </Buttons>
          <Flex items="center">
            <Input
              type="number"
              className="mr-2 h-8 w-[50px] rounded-md text-center"
              value={perPagePreview}
              min={1}
              max={filteredData.length}
              onChange={setPerPage}
            />
            <small className="mt-6 md:mt-0">
              Page {numPages === 0 ? 0 : currentPage + 1} of {numPages}
            </small>
          </Flex>
        </div>
      </div>
    </Card>
  );
}
