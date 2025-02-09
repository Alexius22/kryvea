import { mdiPencil } from "@mdi/js";
import React from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocTextDoc } from "./Poc.types";

type PocTextProps = {
  pocDoc: PocTextDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPocTextChange: <T>(currentIndex, key: keyof T) => (e: React.ChangeEvent) => void;
};

export default function PocText({ pocDoc, currentIndex, pocList, onPositionChange, onPocTextChange }: PocTextProps) {
  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiPencil} size={100} />
      <div className="flex flex-col gap-3">
        <div className="col-span-1 col-start-12 grid">
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
            onChange={onPocTextChange<PocTextDoc>(currentIndex, "description")}
          />
        </div>
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${currentIndex}`}>Language</label>
          <input
            id={`poc-title-${currentIndex}`}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.language}
            onChange={onPocTextChange<PocTextDoc>(currentIndex, "language")}
          />
        </div>
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${currentIndex}`}>Text</label>
          <input
            id={`poc-title-${currentIndex}`}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.text}
            onChange={onPocTextChange<PocTextDoc>(currentIndex, "text")}
          />
        </div>
      </div>
    </div>
  );
}
