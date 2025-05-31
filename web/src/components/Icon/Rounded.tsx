import { ColorKey } from "../../interfaces";
import Icon from "./Icon";

type Props = {
  icon: string;
  color: ColorKey;
  w?: string;
  h?: string;
  bg?: boolean;
  className?: string;
};

export default function IconRounded({ icon, color, w = "w-12", h = "h-12", bg = false, className = "" }: Props) {
  const classAddon = bg ? "bg-white" : `text-black bg-gray-50 dark:bg-slate-800`;

  return <Icon path={icon} w={w} h={h} size="24" className={`rounded-full ${classAddon} ${className}`} />;
}
