import { mdiMenuClose, mdiMenuOpen } from "@mdi/js";
import { useState } from "react";
import { Link } from "react-router";
import Flex from "../Composition/Flex";
import Button from "../Form/Button";
import SidebarContent from "./SidebarContent";

type Props = {
  className?: string;
};

export default function Sidebar({ className = "" }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${className} ${isCollapsed ? "w-[80px]" : "w-[400px]"} `}>
      <Flex className="h-full" col>
        {/* Header */}
        <header
          className={`flex items-center p-4 transition-all ${isCollapsed ? "justify-center border-transparent" : "justify-between border-b border-[color:--border-secondary]"} `}
        >
          {!isCollapsed && (
            <Link to="/dashboard" className="text-lg font-black transition-opacity duration-300">
              Kryvea
            </Link>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-[color:--link]"
            variant="transparent"
            icon={isCollapsed ? mdiMenuClose : mdiMenuOpen}
          />
        </header>

        {/* Content */}
        <div
          className={`flex-1 overflow-auto transition-opacity duration-300 ${isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"} `}
        >
          <SidebarContent className="flex flex-col gap-4 p-4 text-[color:--link]" />
        </div>
      </Flex>
    </aside>
  );
}
