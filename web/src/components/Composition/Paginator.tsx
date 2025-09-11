import { memo, useCallback } from "react";
import { v4 } from "uuid";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import Input from "../Form/Input";
import Flex from "./Flex";

export default function Paginator({
  currentPage,
  pagesList,
  filteredData,
  backendTotalRows,
  setCurrentPage,
  perPage,
  setPerPage,
}) {
  const getPaginatorKey = useCallback((page: number) => `paginator-${page}-${v4()}`, []);

  const isInTheMiddle = currentPage > 1 && currentPage < pagesList.length - 2;

  const isLessThan10 = pagesList.length < 10;

  const EllipsisButton = memo(() => <Button variant="secondary" small text="..." disabled={true} onClick={() => {}} />);

  const isOverlapping = page => page + 1 < 3 || page > pagesList.length - 3;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-3 md:flex-row md:py-0">
      <Buttons className="flex-nowrap !overflow-x-scroll">
        {isLessThan10 ? (
          pagesList.map(page => (
            <Button
              small
              variant={currentPage === page ? "" : "secondary"}
              text={page + 1}
              disabled={page === currentPage}
              onClick={() => setCurrentPage(page)}
              key={getPaginatorKey(page)}
            />
          ))
        ) : (
          <>
            {pagesList.slice(0, isInTheMiddle ? 2 : 3).map(page => (
              <Button
                small
                variant={currentPage === page ? "" : "secondary"}
                text={page + 1}
                disabled={page === currentPage}
                onClick={() => setCurrentPage(page)}
                key={getPaginatorKey(page)}
              />
            ))}

            {isInTheMiddle ? (
              <>
                <EllipsisButton />
                {pagesList
                  .slice(currentPage - 2, currentPage + 3)
                  .map(page =>
                    isOverlapping(page) ? null : (
                      <Button
                        small
                        className="sticky left-0"
                        variant={currentPage === page ? "" : "secondary"}
                        text={page + 1}
                        disabled={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        key={getPaginatorKey(page)}
                      />
                    )
                  )}
                <EllipsisButton />
              </>
            ) : (
              <EllipsisButton />
            )}

            {pagesList.splice(isInTheMiddle ? -2 : -3).map(page => (
              <Button
                small
                className="sticky right-0"
                variant={currentPage === page ? "" : "secondary"}
                text={page + 1}
                disabled={page === currentPage}
                onClick={() => setCurrentPage(page)}
                key={getPaginatorKey(page)}
              />
            ))}
          </>
        )}
      </Buttons>
      <Flex className="sticky right-0" items="center">
        <Input
          type="number"
          className="mr-2 h-8 w-[50px] rounded-md text-center"
          id="paginator-per-page-input"
          value={perPage}
          min={1}
          max={backendTotalRows ?? filteredData.length}
          onChange={setPerPage}
        />
        <small className="text-nowrap">per page</small>
      </Flex>
    </div>
  );
}
