import React, { ReactNode, useContext, useMemo } from "react";
import { Link, useResolvedPath } from "react-router";
import { GlobalContext } from "../App";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

export default function Breadcrumb({ homeElement, separator, capitalizeLinks }: TBreadCrumbProps) {
  const {
    useCtxCustomer: [ctxCustomer],
    useCtxAssessment: [ctxAssessment],
    useCtxVulnerability: [ctxVulnerability],
    useCtxCategory: [ctxCategory],
  } = useContext(GlobalContext);
  const IdNameTuples = useMemo(
    () => [
      [ctxCustomer?.id, ctxCustomer?.name],
      [ctxAssessment?.id, ctxAssessment?.name],
      [ctxVulnerability?.id, ctxVulnerability?.detailed_title],
      [ctxCategory?.id, ctxCategory?.name],
    ],
    [ctxCustomer, ctxAssessment, ctxVulnerability, ctxCategory]
  ); // will be filled as we go on building breadcrumbs with IDs

  const pathNames = useResolvedPath(undefined)
    .pathname.split("/")
    .filter(path => path);

  return (
    <div className="align-middle">
      <ul className="flex gap-2">
        <li className={"hover:underline"}>
          <Link to={"/"}>{homeElement}</Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          // Replace underscores with spaces
          const displayName = link.replace(/_/g, " ");
          // Capitalize links if required
          let itemLink = capitalizeLinks ? displayName.replace(/\b\w/g, char => char.toUpperCase()) : displayName;
          for (const [id, name] of IdNameTuples) {
            console.log(`Breadcrumb: Replacing ${link} with ${id}`);
            if (link === id) {
              itemLink = name;
              break;
            }
          }

          // Generate the href
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;

          const isLast = pathNames.length === index + 1;

          return (
            <React.Fragment key={index}>
              <li className={`${!isLast && "hover:underline"}`}>
                {isLast ? <span className="hover:no-underline">{itemLink}</span> : <Link to={href}>{itemLink}</Link>}
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
}
