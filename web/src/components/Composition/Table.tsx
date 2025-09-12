import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { isValidElement, useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import Input from "../Form/Input";
import Card from "./Card";
import Icon from "./Icon";
import Paginator from "./Paginator";
import Shimmer from "./Shimmer";

interface BaseTableProps {
  data: any[];
  defaultFilterText?: string;
  perPageCustom?;
  wMin?: true;
  maxWidthColumns?: Record<string, string>;
  loading?: boolean;
}

interface WithoutBackendSearchProps {
  backendCurrentPage?: undefined;
  backendTotalPages?: undefined;
  backendTotalRows?: undefined;
  backendSearch?: undefined;
  onBackendSearch?: undefined;
  onBackendChangePage?: undefined;
  onBackendChangePerPage?: undefined;
}

interface WithBackendSearchProps {
  backendCurrentPage: number;
  backendTotalPages: number;
  backendTotalRows: number;
  backendSearch: string;
  onBackendChangePage: (page: number) => void;
  onBackendChangePerPage: (perPage: number) => void;
  onBackendSearch: (query: string) => void;
}

type TableProps = (BaseTableProps & WithoutBackendSearchProps) | (BaseTableProps & WithBackendSearchProps);

const PAGE_FLOOR = 1;

export default function Table({
  data,
  defaultFilterText = "",
  perPageCustom = 5,
  wMin,
  maxWidthColumns = {},
  loading,
  backendCurrentPage,
  backendTotalPages,
  backendTotalRows,
  backendSearch,
  onBackendSearch,
  onBackendChangePage,
  onBackendChangePerPage,
}: TableProps) {
  const [perPage, setPerPage] = useState(perPageCustom);
  const [currentPage, setCurrentPage] = useState(1);
  const [keySort, setKeySort] = useState<{ header: string; order: 1 | 2 }>();
  const [filterText, setFilterText] = useState(defaultFilterText);
  const [filteredData, setFilteredData] = useState(data ?? []);

  const BUTTONS_KEY = useMemo(() => "buttons", []);
  const getTableElementKey = useCallback((element: string) => `table-${element}-${v4()}`, []);

  useEffect(() => {
    setFilteredData(
      (data ?? []).filter(obj => {
        return Object.entries(obj)
          .filter(([key]) => key !== BUTTONS_KEY)
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
    if (backendTotalPages) {
      return arr; // backend already paginated
    }

    switch (keySort?.order) {
      case 1:
        arr = arr.sort(sortAscend);
        break;
      case 2:
        arr = arr.sort(sortDescend);
        break;
      case undefined:
        arr = filteredData;
        break;
    }

    return arr.slice(perPage * (currentPage - PAGE_FLOOR), perPage * currentPage);
  };

  const numPages = useMemo(() => {
    if (backendTotalPages) {
      return backendTotalPages;
    }

    let num = Math.ceil(filteredData.length / perPage);
    if (isNaN(num)) {
      return 0;
    }
    return num;
  }, [filteredData.length, perPage, backendTotalRows, backendTotalPages]);

  const pagesList = [];
  for (let i = PAGE_FLOOR; i <= numPages; i++) {
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
    <Card className={`!relative !gap-0 !p-0 ${wMin ? "w-min" : ""}`}>
      <Input
        className="rounded-t-2xl bg-transparent p-[11px] focus:border-transparent"
        placeholder="Search"
        id={getTableElementKey("search")}
        type="text"
        value={backendSearch ?? filterText}
        onChange={e => {
          setCurrentPage(PAGE_FLOOR);
          onBackendChangePage?.(PAGE_FLOOR);

          if (onBackendSearch) {
            onBackendSearch(e.target.value);
            return;
          }

          setFilterText(e.target.value);
        }}
      />
      <div className="grid gap-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            {filteredData.length > 0 && (
              <thead>
                <tr>
                  {Object.keys(filteredData[0]).map(key =>
                    key === BUTTONS_KEY ? (
                      <th
                        style={{
                          width: "1%",
                          whiteSpace: "nowrap",
                        }}
                        key={getTableElementKey(`header-${key}`)}
                      />
                    ) : (
                      <th
                        className="cursor-pointer align-middle hover:opacity-60"
                        onClick={onHeaderClick(key)}
                        key={getTableElementKey(`header-${key}`)}
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
              {loading ? (
                Array(perPage)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={getTableElementKey(`shimmer${i}`)}>
                      <td>
                        <Shimmer />
                      </td>
                      <td>
                        <Shimmer />
                      </td>
                      <td>
                        <Shimmer />
                      </td>
                    </tr>
                  ))
              ) : filteredData.length === 0 ? (
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
                  <tr key={getTableElementKey(`row-${i}`)}>
                    {Object.entries<any>(obj).map(([key, value]) => {
                      // If this column should have max-width and ellipsis
                      if (maxWidthColumns[key]) {
                        return (
                          <td className="text-nowrap" key={getTableElementKey(`${key}-value-${i}`)}>
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
                      if (key === BUTTONS_KEY) {
                        return (
                          <td className="sticky right-0" data-buttons-cell key={getTableElementKey(`${key}-cell-${i}`)}>
                            {value}
                          </td>
                        );
                      }

                      return (
                        <td className="text-nowrap" key={getTableElementKey(`${key}-value-${i}`)}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div>
          <Paginator
            {...{
              currentPage: backendCurrentPage ?? currentPage,
              filteredData,
              pagesList,
              perPage,
              backendTotalRows,
              setCurrentPage: selectedPage => {
                setCurrentPage(selectedPage);
                onBackendChangePage?.(selectedPage);
              },
              setPerPage: selectedPerPage => {
                setCurrentPage(PAGE_FLOOR);
                onBackendChangePage?.(PAGE_FLOOR);
                setPerPage(selectedPerPage);
                onBackendChangePerPage?.(selectedPerPage);
              },
            }}
          />
        </div>
        <div /> {/* Empty element just to even the last element gap */}
      </div>
    </Card>
  );
}
