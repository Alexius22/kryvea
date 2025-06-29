import { Link } from "react-router";
import SidebarContent from "./SidebarContent";

type Props = {
  className?: string;
};

export default function Sidebar({ className = "" }: Props) {
  return (
    <aside className={className}>
      <div>
        <header className="flex h-14 items-center">
          <div className="flex-1 text-center">
            <Link className="font-black" to="/dashboard">
              Kryvea
            </Link>
          </div>
        </header>
        <div>
          <SidebarContent className="flex flex-col gap-4 p-4 text-[color:--link]" />
        </div>
      </div>
    </aside>
  );
}
