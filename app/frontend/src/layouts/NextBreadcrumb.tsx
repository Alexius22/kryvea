import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({ homeElement, separator, capitalizeLinks }: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter(path => path);

  return (
    <div className="pl-4">
      <ul className="flex gap-2">
        <li className={"hover:underline hover:text-slate-500"}>
          <Link href={"/"}>{homeElement}</Link>
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
                {isLast ? <span>{itemLink}</span> : <Link href={href}>{itemLink}</Link>}
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default NextBreadcrumb;
