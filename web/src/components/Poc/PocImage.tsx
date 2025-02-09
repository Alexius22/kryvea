import { mdiImage } from "@mdi/js";
import React from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocImageDoc } from "./Poc.types";

type PocImageProps = {
  pocDoc: PocImageDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPocTextChange: <T>(currentIndex, key: keyof T) => (e: React.ChangeEvent) => void;
};

export default function PocImage({ pocDoc, currentIndex, pocList, onPositionChange, onPocTextChange }: PocImageProps) {
  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiImage} size={100} />
      <div className="flex flex-col gap-3">
        <div className="col-span-1 grid">
          <label htmlFor={`poc-position-${currentIndex}`}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={`poc-position-${currentIndex}`}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={`poc-description-${currentIndex}`}
            onChange={onPocTextChange<PocImageDoc>(currentIndex, "description")}
          />
        </div>
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${currentIndex}`}>Choose File</label>
          <input
            id={`poc-title-${currentIndex}`}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.chooseFile}
            onChange={() => alert("Not implemented")}
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Caption</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.caption}
            id={`poc-description-${currentIndex}`}
            onChange={onPocTextChange<PocImageDoc>(currentIndex, "caption")}
          />
        </div>
      </div>
    </div>
  );
}
