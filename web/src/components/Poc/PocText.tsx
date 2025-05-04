import { mdiPencil } from "@mdi/js";
import React from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocTextDoc } from "./Poc.types";

type PocTextProps = {
  pocDoc: PocTextDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
};

export default function PocText({ pocDoc, currentIndex, pocList, onPositionChange, onTextChange }: PocTextProps) {
  const positionInputId = `poc-position-${currentIndex}-${pocDoc.key}`;
  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const textInputId = `poc-text-${currentIndex}-${pocDoc.key}`;
  const languageInputId = `poc-language-${currentIndex}-${pocDoc.key}`;

  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiPencil} size={100} />
      <div className="flex flex-col gap-3">
        <div className="col-span-1 col-start-12 grid">
          <label htmlFor={positionInputId}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={positionInputId}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={descriptionTextareaId}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={descriptionTextareaId}
            onChange={onTextChange<PocTextDoc>(currentIndex, "description")}
          />
        </div>

        <div className="col-span-4 grid">
          <label htmlFor={languageInputId}>Language</label>
          <input
            id={languageInputId}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.language}
            onChange={onTextChange<PocTextDoc>(currentIndex, "language")}
          />
        </div>

        <div className="col-span-4 grid">
          <label htmlFor={textInputId}>Text</label>
          <input
            id={textInputId}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.text}
            onChange={onTextChange<PocTextDoc>(currentIndex, "text")}
          />
        </div>
      </div>
    </div>
  );
}
