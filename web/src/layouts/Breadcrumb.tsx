import React, { ReactNode } from "react";
import { Link, useResolvedPath } from "react-router";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const Breadcrumb = ({ homeElement, separator, capitalizeLinks }: TBreadCrumbProps) => {
  const pathNames = useResolvedPath(undefined)
    .pathname.split("/")
    .filter(path => path);

  return (
    <div className="pl-4">
      <ul className="flex gap-2">
        <li className={"hover:text-slate-500 hover:underline"}>
          <Link to={"/"}>{homeElement}</Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          // Replace underscores with spaces
          const displayName = link.replace(/_/g, " ");
          // Capitalize links if required
          const itemLink = capitalizeLinks ? displayName.replace(/\b\w/g, char => char.toUpperCase()) : displayName;
          // Generate the href
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;

          const isLast = pathNames.length === index + 1;

          return (
            <React.Fragment key={index}>
              <li className={`${!isLast && "hover:text-slate-600 hover:underline"}`}>
                {isLast ? <span>{itemLink}</span> : <Link to={href}>{itemLink}</Link>}
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumb;
