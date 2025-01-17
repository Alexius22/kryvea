import OverlayLayer from "../OverlayLayer";
import AsideMenuLayer from "./Layer";

type Props = {
  isAsideMobileExpanded: boolean;
  isAsideLgActive: boolean;
  onAsideLgClose: () => void;
};

export default function AsideMenu({ isAsideMobileExpanded = false, isAsideLgActive = false, onAsideLgClose }: Props) {
  return (
    <>
      <AsideMenuLayer
        className={`${isAsideMobileExpanded ? "left-0" : "-left-60 lg:left-0"} ${
          !isAsideLgActive ? "lg:hidden xl:flex" : ""
        }`}
        onAsideLgCloseClick={onAsideLgClose}
      />
      {isAsideLgActive && <OverlayLayer zIndex="z-30" onClick={onAsideLgClose} />}
    </>
  );
}
